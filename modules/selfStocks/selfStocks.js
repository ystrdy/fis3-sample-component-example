var _ = require('/modules/util/util'),
	login = require('/modules/login/login'),
	TipsLine = require('/modules/TipsLine/TipsLine'),
	rdp = require('/modules/RealDataPool/RealDataPool');

var SelfStocks = function(options){
	this.opt = $.extend({
		hotUrl : '/api/gethot',
		getSelfUrl : '/user/getfavorite/',
		delSelfUrl : '/user/delfavorite/',
		addSelfUrl : '/user/addfavorite/'
	}, options || {});
	this.$container = $('.self_stocks');
	this.$list = this.$container.find('.ss_list');
	this.$switcher = this.$container.find('.ss_head a');
	this.tId = -1;
	this.interval = 3 * 1000;
	this.tips = new TipsLine('.self_stocks');

	this.init();
};

SelfStocks.prototype = {
	init : function(){
		var $container = this.$container,
			opt = this.opt,
			self = this;

		// 从url中检查模块的入口
		var hash = location.hash;
		if (hash === '#ss') {
			this.selfStock();
		} else {
			this.lastVisit();
		}

		$container.on('click', '.ss_head a:not(.cur)', function(event){
			switch($(this).index()){
				case 0:
					self.lastVisit();
					break;
				case 1:
					self.selfStock();
					break;
			}
			event.preventDefault();
		}).on('click', '.ssl_btn_del', function(){
			var $li = $(this).closest('li'),
				type = $li.data('type'),
				symbol = $li.data('symbol');
			$li.remove();
			if (type === 'history') {			// 删最近访问股
				_.history.del(symbol);
				self.tips.show('删除最近访问股成功.');
			} else if (type === 'self') {		// 删自选股
				self.getStock(opt.delSelfUrl+symbol, function(data){
					data = JSON.parse(data);
					if (data && data.status === 'success') {
						$li.remove();
						self.tips.show('删除自选股成功.');
					}
				});
			}
		}).on('click', '.ssl_btn_add', function(){
			var $li = $(this).closest('li'),
				type = $li.data('type'),
				symbol = $li.data('symbol');
			if (type === 'hot') {
				self.getStock(opt.addSelfUrl+symbol, function(data){
					data = JSON.parse(data);
					if (data && data.status === 'success') {
						$li.remove();
						self.tips.show('添加自选股成功.');
					}
				});
			}
		});
	},
	/**
	 * 最近访问股的入口，拿到最近访问股的股票代码和热门股票代码，之后直接通过renderList渲染
	 */
	lastVisit : function(){
		var self = this,
			opt = this.opt;
		this.getStock(opt.hotUrl, function(data){		// 拿热门股票数据
			data = JSON.parse(data);
			var hSyms = data.map(function(item){
					return {
						symbol : item.symbol,
						type : 'add',			// 按钮类型
						t : 'hot'
					}
				}),
				cSyms = _.history.get().map(function(symbol){
					return {
						symbol : symbol,
						type : 'del',
						t : 'history'
					}
				});
			self.$switcher.removeClass('cur').eq(0).addClass('cur');
			self.renderList(cSyms.concat([{type: 'sep'}], hSyms));
		});
	},
	/**
	 * 我的自选股的入口，检查用户是否登录，若登录直接拿到自选股的数据渲染，否则，弹窗提示用户登录
	 */
	selfStock : function(){
		var self = this,
			opt = this.opt;
		this.getStock(opt.getSelfUrl, function(data){
			data = JSON.parse(data);
			var status = data.status.toLowerCase();
			if (status === 'unauthorized') {
				login.show();
				login.logined = function(){
					var data = arguments[0];
					if (data && data.status === 'success') {
						location.href = '/#ss';
						location.reload();
					}
				};
			} else if (status === 'success') {
				self.$switcher.removeClass('cur').eq(1).addClass('cur');
				self.renderList(data.data.map(function(item){
					return {
						symbol : item.symbol,
						type : 'del',
						t : 'self'
					};
				}));
			}
		});
	},
	/**
	 * 拿股票数据
	 */
	getStock : function(uri, callback){
		var url = _.wrapUrl(uri);
		$.ajax({
			url : url,
			headers : {
				'X-Requested-With' : 'XMLHttpRequest'
			}
		}).done(callback);
	},
	/**
	 * 通过传入的数据渲染列表
	 */
	renderList : function(data){
		var symbols = data.filter(function(item){
				return !!item.symbol;
			}).map(function(item){
				return item.symbol;
			}),
			self = this;
		rdp.set(symbols);
		rdp.ajax(symbols).done(function(ajaxData){
			ajaxData = JSON.parse(ajaxData);
			var TPL = '<li class="@classname@" data-symbol="@symbol@" data-type="@t@"><a href="/a/@symbol@"><strong>@name@</strong><span>@current@</span><span>@percentage@</span></a><i class="ssl_btn_@type@"></i></li>';
			self.$list.html(data.reduce(function(prev, item){
				var symbol = item.symbol,
					type = item.type, current,
					_data, name, change, classname,
					percentage, type, html = '';
				if (symbol) {
					_data = ajaxData[symbol];
					name = _data.name;
					current = _data.current;
					change = _data.change;
					percentage = _data.percentage;
					classname = change > 0 ? 'rise' : change < 0 ? 'fall' : 'equal';

					html = _.render({
						classname : classname,
						symbol : symbol,
						name : name,
						current : current,
						percentage : percentage + '%',
						type : type,
						t : item.t
					}, TPL);
				} else {
					if (type === 'sep') {
						html = '<li class="ssl_sep">以下为热门股票</li>';
					}
				}
				return prev + html;
			}, ''));
			self.$container.removeClass('loading');
			// 开启实时更新
			self.realUpdate();
		});
	},
	/**
	 * 开启列表的实时更新功能
	 */
	realUpdate : function(){
		var self = this;
		clearInterval(this.tId);
		this.tId = setInterval(function(){
			var $list = self.$list,
				$items = $list.find('li');
			$items.each(function(){
				try{
					var symbol = $(this).data('symbol'),
						data = rdp.get(symbol)[symbol],
						$spans = $(this).find('span'),
						$change = $spans.eq(0),
						$percentage = $spans.eq(1);
					$change.html(data.change);
					$percentage.html(data.percentage+'%');
					$(this).attr('class', change > 0 ? 'rise' : change < 0 ? 'fall' : 'equal');
				}
				catch(e){}
			});
		}, this.interval);
	}
};

module.exports = function(options){
	return new SelfStocks(options);
};