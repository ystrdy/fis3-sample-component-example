var rdp = require('/modules/RealDataPool/RealDataPool'),
	_ = require('/modules/util/util');

var stocks = [{
		name : '上证指数',
		symbol : 'sh000001'
	}, {
		name : '深证成指',
		symbol : 'sz399001'
	}, {
		name : '中小板指',
		symbol : 'sz399005'
	}, {
		name : '创业板指',
		symbol : 'sz399006'
	}, {
		name : '沪深300',
		symbol : 'sh000300'
	}],
	symbols = stocks.map(function(item){
		return item.symbol
	});

var create = function($container){
	var TPL = '<li class="@classname@"><a href="@url@">@name@:<i>@current@</i><i>@percentage@</i></a></li>';
	rdp.ajax(symbols).done(function(data){
		try{
			data = JSON.parse(data);
			$container.html(stocks.reduce(function(prev, item){
				var symbol = item.symbol,
					stockData = data[symbol],
					lastClose = +stockData.last_close,
					current = +stockData.current,
					percentage = +stockData.percentage,
					classname = '';
				if (current > lastClose) {
					classname = 'rise';
					percentage = '↑' + percentage.toFixed(2);
				} else if (current < lastClose) {
					classname = 'fall';
					percentage = '↓' + percentage.toFixed(2);
				} else {
					classname = 'equal';
				}
				percentage += '%';
				current = current.toFixed(2);
				return prev + _.render({
					classname : classname,
					url : '/a/'+symbol,
					name : item.name,
					current : current,
					percentage : percentage
				}, TPL);
			}, ''));
		} catch(e){
			console && console.error(e);
		}
	});
	rdp.set(symbols);
};

var realUpdate = function($container){
	setInterval(function(){
		var data = rdp.get(symbols),
			$items = $container.find('li');
		$items.each(function(index){
			var symbol = symbols[index],
				itemData = data[symbol],
				$i = $(this).find('i'),
				$current = $i.eq(0),
				$percentage = $i.eq(1),
				lastClose, current,
				percentage, classname;
			if (itemData) {
				lastClose = +itemData.last_close;
				current = +itemData.current;
				percentage = +itemData.percentage;

				if (current > lastClose) {
					classname = 'rise';
					percentage = '↑' + percentage.toFixed(2);
				} else if (current < lastClose) {
					classname = 'fall';
					percentage = '↓' + percentage.toFixed(2);
				} else {
					classname = 'equal';
				}
				percentage += '%';
				current = current.toFixed(2);

				$current.html(current);
				$percentage.html(percentage);
				this.className = classname;
			}
		});
	}, 3 * 1000);
};

module.exports = function(options){
	var opt = _.extend({
			container : ''
		}, options || {}),
		$container = $(opt.container);

	create($container);
	realUpdate($container);
};