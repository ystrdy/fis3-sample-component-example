/*------------------
Created:2015/12/23
author:xuxufei
email:xuxufei@2144.cn
website:
-----------------*/
var _ = require('/modules/util/util.js');

var options = {
	container : '.global_market',
	title : '全球市场',
	index : 0,
	categorys : [{
		text : '亚太',
		data : [{
			name : '恒生指数',
			code : 's_r_hkHSI',
			image : 'http://img.gtimg.cn/images/hq_parts_little3/hk/indexs/HSI.png'
		}, {
			name : '台湾加权指数',
			code : 'gzTWII'
		}, {
			name : '中证腾安',
			code : 's_sh000847',
			image : 'http://img.gtimg.cn/images/hq_parts_little3/hushen/indexs/000847.png'
		}, {
			name : '日经225指数',
			code : 'gzN225'
		}, {
			name : '上证指数',
			code : 's_sh000001',
			image : 'http://img.gtimg.cn/images/hq_parts_little3/hushen/indexs/000001.png'
		}, {
			name : '深证成指',
			code : 's_sz399001',
			image : 'http://img.gtimg.cn/images/hq_parts_little3/hushen/indexs/399001.png'
		}]
	}, {
		text : '欧洲',
		data : [{
			name : '英国富时100指数',
			code : 'gzFTSE'
		}, {
			name : '德国DAX 30种股价指数',
			code : 'gzGDAXI'
		}, {
			name : '俄罗斯MICEX指数',
			code : 'gzINDEXCF'
		}, {
			name : '法国CAC40指数',
			code : 'gzFCHI'
		}, {
			name : '瑞士股票指数',
			code : 'gzSSMI'
		}, {
			name : '富时意大利MIB指数',
			code : 'gzFTSEMIB'
		}]
	}, {
		text : '美洲',
		data : [{
			name : '道琼斯',
			code : 'usDJI',
			image : 'http://img.gtimg.cn/images/hq_parts_little3/as/stocks/DJI.png?0.1465331190265715'
		}, {
			name : '纳斯达克',
			code : 'usIXIC',
			image : 'http://img.gtimg.cn/images/hq_parts_little3/as/stocks/IXIC.png?0.0823541993740946'
		}, {
			name : '标普500',
			code : 'usINX'
		}, {
			name : '加拿大S&P/TSX综合指数',
			code : 'gzGSPTSE'
		}, {
			name : '墨西哥BOLSA指数',
			code : 'gzMXX'
		}, {
			name : '巴西BOVESPA股票指数',
			code : 'gzIBOV'
		}]
	}]
};

var GlobalMarket = function(options){
	this.options = options;
	this.$container = null;

	this.init();
	this.error = _.error;
};

GlobalMarket.prototype = {
	init : function(){
		var options = this.options,
			$container = this.$container = $(options.container),
			index = options.index,
			self = this;

		if (!$container.length) {
			this.error('未找到渲染的节点.');
			return;
		}
		this.create(index)

		$container.on('click', '.gm_head a:not(.cur)', function(event){
			self.switcher($(this).index());
			event.preventDefault();
		}).on('mouseenter', '.gm_list li.hasImage', function(){
			$(this).addClass('cur').siblings('.hasImage').removeClass('cur');
			var $image = $(this).find('img'),
				src = $image.attr('data-src');
			if (src) {
				$image.attr('src', src).removeAttr('data-src');
			}
		});
	},
	create : function(index){
		var options = this.options,
			categorys = options.categorys,
			$container = this.$container,
			TPL = '<h2 class="tit1">全球市场</h2><div class="gm_head">@switcher@</div>@list@';
		this.createList(index).done(function(list){
			if (!list) {
				return;
			}
			$container.html(_.render({
				switcher : categorys.reduce(function(prev, item, i){
					var TPL = '<a href="javascript:;" target="_self" class="@classname@">@text@</a>';
					return prev + _.render({
						classname : index === i ? 'cur' : '',
						text : item.text
					}, TPL);
				}, ''),
				list : list
			}, TPL)).removeClass('loading');
		});
	},
	createList : function(index){
		var def = $.Deferred(),
			data = this.options.categorys[index].data,
			url = 'http://qt.gtimg.cn/q=' + data.reduce(function(prev, item){
				return prev + ',' + item.code;
			}, '').slice(1)+'&'+new Date().getTime();
		$.ajax(url).done(function(__d){
			eval(__d);
			var TPL = '<li class="@rf@ @isImage@ @isCurrent@"><span class="gml_name">@name@</span><span class="gml_current">@current@</span><span class="gml_percent">@percentage@</span>@image@</li>',
				curIndex = -1;
			data.forEach(function(item, i){
				if (!~curIndex && item.image) {
					curIndex = i;
				}
			});
			try{
				def.resolve('<ul class="gm_list">' + data.reduce(function(prev, item, i){
						var str = window['v_'+item.code],
							split = str.split('~'),
							real = split[0] == 'real',
							current = split[3],
							change = real ? split[31] : split[4],
							percentage = real ? split[32] : split[5];

						return prev + _.render({
							rf : change > 0 ? 'rise' : change < 0 ? 'fall' : 'equal',
							isImage : item.image ? 'hasImage' : '',
							isCurrent : curIndex === i ? 'cur' : '',
							name : item.name,
							current : current,
							percentage : percentage+'%',
							image : item.image ? '<img '+(curIndex===i?'':'data-')+'src="'+item.image+'">' : ''
						}, TPL);
				}, '') + '</ul>');
			} catch(e){}
		}).fail(function(){
			def.reject();
		});
		return def.promise();
	},
	switcher : function(index){
		var $container = this.$container,
			$list = $container.find('.gm_list'),
			$switcher = $container.find('.gm_head a'),
			$l = $list.eq(index);
		$container.addClass('cur');
		if (!$l.length) {
			this.createList(index).done(function(list){
				var $_list = $(list);
				$switcher.removeClass('cur').eq(index).addClass('cur');
				$list.addClass('hidden');
				$_list.appendTo($container);
				$container.removeClass('loading');
			});
		} else {
			$switcher.removeClass('cur').eq(index).addClass('cur');
			$list.addClass('hidden');
			$l.removeClass('hidden');
			$container.removeClass('loading');
		}
	}
};

module.exports = function(opt){
	return new GlobalMarket($.extend(options, opt||{}));
};

/*http://qt.gtimg.cn/q=s_r_hkHSI,gzTWII,s_sh000847,gzN225,s_sh000001,s_sz399001

v_s_r_hkHSI="100~恒生指数~HSI~21999.62~80.00~0.36~3786222.9447~3786222.94~~0~";
http://img.gtimg.cn/images/hq_parts_little3/hk/indexs/HSI.png
v_gzTWII="TWII~台湾加权指数~00:49:00~8293.91~-64.58~-0.77~AP~";
无图
v_s_sh000847="1~中证腾安~000847~2651.68~35.91~1.37~14705701~2761656~~";
http://img.gtimg.cn/images/hq_parts_little3/hushen/indexs/000847.png
v_gzN225="N225~日经225指数~01:15:02~18982.23~108.88~0.58~AP~";
无图
v_s_sh000001="1~上证指数~000001~3563.74~29.96~0.85~182551923~25093891~~";
http://img.gtimg.cn/images/hq_parts_little3/hushen/indexs/000001.png
v_s_sz399001="51~深证成指~399001~12806.16~119.82~0.94~215009940~40879399~~";
http://img.gtimg.cn/images/hq_parts_little3/hushen/indexs/399001.png

http://qt.gtimg.cn/q=gzFTSE,gzGDAXI,gzINDEXCF,gzFCHI,gzSSMI,gzFTSEMIB

v_gzFTSE="FTSE~英国富时100指数~05:14:01~6273.70~19.06~0.30~EU~";
v_gzGDAXI="GDAXI~德国DAX 30种股价指数~05:14:14~10808.37~154.46~1.45~~";
v_gzINDEXCF="INDEXCF~俄罗斯MICEX指数~05:14:02~1743.98~12.78~0.74~EU~";
v_gzFCHI="FCHI~法国CAC40指数~05:14:00~4676.16~58.21~1.26~EU~";
v_gzSSMI="SSMI~瑞士股票指数~05:13:48~8826.00~86.64~0.99~EU~";
v_gzFTSEMIB="FTSEMIB~富时意大利MIB指数~05:14:14~21634.18~265.03~1.24~EU~";

http://qt.gtimg.cn/r=0.7876760072540492q=usDJI,usIXIC,usINX,gzGSPTSE,gzMXX,gzIBOV

v_usDJI="real~道琼斯~.DJI~17528.27~17552.17~17535.66~59765861~0~0~17525.87~0.00~0~0~0~0~0~0~0~0~17530.94~0.00~0~0~0~0~0~0~0~0~0~2015-12-28 16:33:46~-23.90~-0.14~17536.90~17437.34~green~59765861~0~0~0.00~0~0~0~0~0~0.00~Dow Jones~0.00~18351.36~15370.33~0~";
http://img.gtimg.cn/images/hq_parts_little3/as/stocks/DJI.png?0.1465331190265715
v_usIXIC="real~纳斯达克~.IXIC~5040.98~5048.49~5032.29~1302754604~0~0~0.000~0.00~0~0~0~0~0~0~0~0~0.000~0.00~0~0~0~0~0~0~0~0~0~2015-12-28 16:34:59~-7.51~-0.15~5041.27~4999.07~green~1302754604~0~0~0.00~0~0~0~0~0~0.00~NASDAQ COMPOSITE~0.00~5231.94~4292.14~0~";
http://img.gtimg.cn/images/hq_parts_little3/as/stocks/IXIC.png?0.0823541993740946
v_usINX="real~标普500~.INX~2056.50~2060.99~2057.77~367737617~0~0~2052.46~0.00~0~0~0~0~0~0~0~0~2059.74~0.00~0~0~0~0~0~0~0~0~0~2015-12-28 16:33:46~-4.49~-0.22~2057.77~2044.20~green~367737617~0~0~0.00~0~0~0~0~0~0.00~S&P 500 index~0.00~2134.72~1867.01~0~";
v_gzGSPTSE="GSPTSE~加拿大S&P/TSX综合指数~2015-12-24~13309.80~24.89~0.19~AM~";
v_gzMXX="MXX~墨西哥BOLSA指数~2015-12-28~43396.16~-132.11~-0.30~AM~";
v_gzIBOV="IBOV~巴西BOVESPA股票指数~2015-12-28~43764.34~-250.59~-0.57~~";

分析：
current = a[3];
change = a[4];
percentage = a[5];

'real' == a[0];
current = a[3];
change = a[31];
percentage = a[32];

*/