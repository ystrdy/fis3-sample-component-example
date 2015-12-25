var swig     = require('swig'),
	Swig     = swig.Swig,
	n 		 = new Swig(),
    sOptions = n.options,
    projectPath  = fis.project.getProjectPath();

fis.match('**', {
	release : false
});

// 编译swig
fis.match('/pages/**/(*).html', {
	parser : function(content, file, conf){
		swig.setDefaults(fis.util.merge(sOptions, {
			cache: false,
			loader: swig.loaders.fs(projectPath)
		}, conf));
		return swig.compile( content.toString(), conf)();
	},
	release : '$1'
});

// 编译sass
fis.match('/pages/**/(*).scss', {
	parser : fis.plugin('node-sass'),
	useSprite: true,
	rExt : '.css',
	release : 'css/$1'
});

// 编译js
fis.match('/pages/**/(*).js', {
	release : 'js/$1'
});

// 发布image
fis.match('/pages/**/(*).{png,jpg,gif}', {
	release : 'images/$1$2'
});
fis.match('/modules/**/(*).{png,jpg,gif}', {
	release : 'images/$1$2'
});

// 标识模块
fis.match('/modules/**', {
	isMod : true
});

// 打包js
fis.hook('commonjs');

// 发布lib
fis.match('/lib/(common).js', {
	release : 'js/$1'
});
// fis.match('/lib/(**).{png,jpg,gif}', {
// 	release : 'images/$1'
// });
fis.match('/lib/(**.png)', {
	release : 'images/$1'
});
fis.match('/lib/(**.jpg)', {
	release : 'images/$1'
});
fis.match('/lib/(**.gif)', {
	release : 'images/$1'
});
fis.match('/lib/(**).scss', {
	parser : fis.plugin('node-sass'),
	useSprite: true,
	rExt : '.css',
	release : 'css/$1'
});

// 发布临时数据
fis.match('/temp/(**)', {
	release : '/temp/$1'
});

fis.match('::package', {
	spriter: fis.plugin('csssprites'),
	postpackager : function(ret, conf, settings, opt){
		var files = [],
			idsMaps = {},
			src = ret.src;
		// 从发布的html中获取待编译的js文件，并以file.id为key包装一个对象
		Object.keys(src).forEach(function(key){
			var file = src[key];
			if (file.ext === '.html'&&!file.isMod){
				file.links.forEach(function(link){
					var f = src[link];
					if (f.ext === '.js'){
						files.push(src[link]);
					}
				});
			}
			if (file.ext === '.js'){
				idsMaps[file.id] = file;
			}
		});
		// 遍历获取js文件require的依赖关系
		var getDependencies = function(id){
			var file = idsMaps[id],
				reqs = file.requires,
				rets = [], temp = {};
			while(reqs.length){
				rets = reqs.concat(rets);
				reqs = reqs.reduce(function(prev, id){
					return prev.concat(idsMaps[id].requires || []);
				}, []);
			}
			// 去重
			rets.forEach(function(id){
				!temp[id] && (temp[id] = true);
			});
			return Object.keys(temp).map(function(id){
				return idsMaps[id];
			});
		};
		// 合并文件
		files.forEach(function(file){
			var content = file.getContent(),
				deps = getDependencies(file.id).sort(function(a, b){
					if (a.isMod && !b.isMod) {
						return 1;
					} else if (!a.isMod && b.isMod) {
						return -1;
					} else {
						return 0;
					}
				}).map(function(file){
					if (!file.isMod) {		// 如果不是模块文件，则替换掉文件中的require
						// \brequire\(['"].*?mod(|\.js)['"]\);?\r?\n?
						var reg = eval('/\\brequire\\([\'"].*?'+file.filename+'(|\\'+file.ext+')[\'"]\\),?;?\\r?\\n?/ig');
						content = content.replace(reg, '');
					}
					return file.getContent();
				});
			deps.push(content);
			file.setContent(deps.join('\n'));
/*			var deps = getDependencies(file.id),
				content = file.getContent(),
				conts = [];
			// 拼装非模块js文件
			conts = deps.filter(function(file){
				return !file.isMod;
			}).map(function(file){
				// \brequire\(['"].*?mod(|\.js)['"]\);?\r?\n?
				var reg = eval('/\\brequire\\([\'"].*?'+file.filename+'(|\\'+file.ext+')[\'"]\\);?\\r?\\n?/ig');
				content = content.replace(reg, '');
				return file.getContent();
			});

			// 拼装模块js文件
			conts = conts.concat(deps.filter(function(file){
				return file.isMod;
			}).map(function(file){
				return file.getContent();
			}));

			// 加入自身内容
			conts.push(content);
			file.setContent(conts.join('\n'));*/
		});
	}
});

// 产品发布
fis.media('pro').match('/pages/**.scss', {
	// useHash : true,
	optimizer: fis.plugin('clean-css')
});
fis.media('pro').match('/{pages,modules,lib}/**.js', {
	// useHash : true,
	optimizer: fis.plugin('uglify-js')
});
fis.media('pro').match('/modules/**.png', {
	// useHash : true,
	optimizer: fis.plugin('png-compressor')
});