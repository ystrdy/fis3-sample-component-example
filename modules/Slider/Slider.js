var Slider = function(options){
	this.opt = $.extend({
		prefix : '',
		isDirect : true,
		isButton : true,
		isAuto : true,
		interval : 5000
	}, options || {});
	this.$container = null;
	this.$viewer = null;
	this.$cont = null;
	this.$buttons = null;
	this.$items = null;
	this.itemWidth = 0;
	this.current = 0;
	this.tId = -1;

	this.init();
};
Slider.prototype = {
	init : function(){
		var opt = this.opt,
			prefix = '.' + opt.prefix,
			$container = this.$container = $(prefix+'_slider'),
			$view = this.$viewer = $container.find(prefix+'_view'),
			$cont = this.$cont = $container.find(prefix+'_cont'),
			$items = this.$items = $view.find('li');
		if (!$container.length || !$view.length || !$items.length) {
			console && console.error('未找到节点.');
			return;
		}
		this.itemWidth = this.$items.outerWidth(true);

		this.create();
		this.eventListener();
		this.auto();
	},
	create : function(){
		var self = this,
			opt = this.opt,
			$container = this.$container,
			$cont = this.$cont,
			$ul = $cont.find('ul'),
			$items = this.$items,
			$buttons = null,
			prefix = opt.prefix,
			html = '';
		// 复制节点
		$cont.append($ul.clone()).width($items.length * 2 * this.itemWidth);
		// 创建点击按钮
		if (opt.isButton) {
			html = '<div class="'+prefix+'_button">';
			$items.each(function(index){
				html += '<a href="javascirpt:;" target="_self"'+ (index != self.current ? '' : ' class="cur"') + '></a>';
			});
			html += '</div>';
			$buttons = this.$buttons = $(html).appendTo($container).find('a');
		}
		// 创建方向按钮
		if (opt.isDirect) {
			html = '<div class="'+prefix+'_direct">'+
						'<a href="javascirpt:;" target="_self" class="'+prefix+'_prev"></a>'+
						'<a href="javascirpt:;" target="_self" class="'+prefix+'_next"></a>'+
					'</div>';
			$(html).appendTo($container);
		}
	},
	eventListener : function(){
		var self = this,
			opt = this.opt,
			prefix = '.' + opt.prefix,
			$container = this.$container;
		$container.on('click', prefix+'_button a:not(.cur)', function(event){	// 点击按钮
			self.move($(this).index());
			event.preventDefault();
		}).on('mouseenter', function(){
			clearInterval(self.tId);
		}).on('mouseleave', function(){
			self.auto();
		}).on('click', prefix+'_prev', function(event){		// 点击上一个
			self.prev();
			event.preventDefault();
		}).on('click', prefix+'_next', function(event){		// 点击下一个
			self.next();
			event.preventDefault();
		});
	},
	move : function(pos){
		var self = this,
			$cont = this.$cont,
			$items = this.$items,
			itemWidth = this.itemWidth;
		if ($cont.is(':animated')) return;
		if (pos < 0) {
			pos = $items.length - 1;
			$cont.css('left', -$items.length * itemWidth);
		}
		$cont.animate({
			'left' : -this.itemWidth * pos
		}, function(){
			if (pos >= $items.length) {
				pos = 0;
				$cont.css('left', 0);
			}
			self.current = pos;
		});
		if (this.opt.isButton) {
			this.$buttons.removeClass('cur').eq(pos%$items.length).addClass('cur');
		}
	},
	prev : function(){
		this.move(this.current-1);
	},
	next : function(){
		this.move(this.current+1);
	},
	auto : function(){
		var opt = this.opt,
			self = this;
		clearInterval(this.tId);
		this.tId = setInterval(function(){
			self.next();
		}, opt.interval);
	}
};

module.exports = function(options){
	return new Slider(options);
};