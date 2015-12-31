require('/modules/Compartibility/Compartibility'); 	// 处理兼容性
var Cookie = require('/modules/Cookie/Cookie');

module.exports = exports = {
	// 一些公用数据
	riseColor : '#ee371f',
	fallColor : '#0d860d',
	equalColor : '#444',
	credits : {
        enabled : true,
        href : 'http://www.2258.com',
        position: {
            align: 'right',
            x: -40,
            verticalAlign: 'bottom',
            y: -10
        },
        style: {
            cursor: 'pointer',
            color: '#909090',
            fontSize: '12px'
        },
        text  : '©2258.com'
    },
    /**
     * 将字符串时间转换为时间戳，若参数不为字符串，则返回当前时间的时间戳
     * @param  {String} date 时间字符串
     * @return {Number}      时间戳
     */
    convertToTimestamp : function(date){
        if (typeof date === 'string') {
            date = date.replace(/-/g, '/');
            return new Date(date).getTime();
        } else {
            return new Date().getTime();
        }
    },
    /**
     * 获取股票的开盘停盘的时间点
     * @param  {Boolean} update  是否立即更新时间点
     * @param  {Date|String} dateTpl 时间模板，用来确定日期
     * @return {Object}         各个时间点
     */
    getPointInTime : function(update, dateTpl){
        var now = exports.convertToTimestamp.call(this, dateTpl),
            pit = {
                am_beginTime : new Date(now),
                am_endTime : new Date(now),
                pm_beginTime : new Date(now),
                pm_endTime : new Date(now)
            };

        pit.am_beginTime.setHours(9,30,0,0);
        pit.am_endTime.setHours(11,30,0,0);
        pit.pm_beginTime.setHours(13,0,0,0);
        pit.pm_endTime.setHours(15,0,0,0);
    	
        return pit;
    },
    /**
     * 大盘缩略图的x轴的点
     */
    xTickPositioner : function(){
        return function(){
            var pit = exports.getPointInTime(),
                d = [
                    new Date(pit.am_beginTime),
                    new Date(pit.am_beginTime),
                    new Date(pit.pm_beginTime),
                    new Date(pit.pm_beginTime),
                    new Date(pit.pm_endTime)
                ];
            d[1].setHours(10,30,0,0);
            d[3].setHours(14,0,0,0);
            return d.map(function(value){
                return value.getTime();
            });
        }
    },
    /**
     * 大盘缩略图的y轴的labels
     */
    yLabelsFormatter : function(){
        var self = this;
        return function(){
            var options = this.axis.options,
                style = options.labels.style,
                clrRise = self.stockRiseColor,
                clrFall = self.stockFallColor,
                clrEqual = self.stockEqualColor,
                last_close = parseFloat(self.last_close),
                price = parseFloat(this.value),
                color = price > last_close ? clrRise : price < last_close ? clrFall : clrEqual;
            // 修改label颜色
            style.color = color;

            return parseInt(price, 10);
        }
    },
    /**
     * 大盘缩略图的y轴的点
     */
    yTickPositioner : function(){
        var self = this;
        return function(min, max){
            var last_close = self.last_close,
                diff = Math.max(Math.abs(min-last_close), Math.abs(max-last_close))*1.1,
                min = last_close - diff,
                max = last_close + diff;
            return [min, (min+last_close)/2, last_close, (max+last_close)/2, max];
        }
    },
    /**
     * 将parseData返回的对象转换成绘图能用的数组
     * @param  {Object} series 由parseData生成的待转换对象
     * @return {Array}        转换成功的数组，能够用于绘图
     */
    makeDrawingArray : function(series){
        var i, current, array = [];
        for(i in series){
            current = series[i].current;
            array.push({
                x : +i,
                y : current === null ? null : +current
            });
        }
        array.sort(function(a, b){
            return a.x - b.x;
        });
        return array;
    },
    /**
     * 将数据解析成绘图的线
     * @param  {Object|Array} data 待解析的数据
     * @return {Array}      可以绘图的线数据
     */
    parseData : function(data){
        if (typeof data === 'object') {
            var fnConvertToTimestamp = exports.convertToTimestamp,
                pit = exports.getPointInTime.call(this, true, data[0]?data[0].time:null),
                series = {}, i, cnt, tt, array = [];
            for(i = new Date(pit.am_beginTime), cnt = 0;
                i <= pit.pm_endTime;
                i.setMinutes(i.getMinutes()+1)){
                if (i > pit.am_endTime && i < pit.pm_beginTime) {
                    continue;
                }
                series[i.getTime()] = {
                    current : null,
                    index : cnt
                };
                cnt++
            }
            for(i in data){
                tt = fnConvertToTimestamp.call(this, data[i].time);
                series[tt].current = +data[i].current;
            }
            return series;
        } else {
            return arguments.callee.call(this, []);
        }
    },
    /**
     * 大盘图的红绿背景
     */
    chartBackground : function(){
        var $container = this.$container,
            chart = this.chart,
            $rect = $container.find('svg>rect').last(),
            x = +$rect.attr('x'),
            y = +$rect.attr('y'),
            width = +$rect.attr('width'),
            height = +$rect.attr('height'),
            half = height / 2 + 1;

        chart.renderer.rect(x, y, width, half).attr({'fill' : '#feeded'}).add();
        chart.renderer.rect(x, y+half, width, height-half).attr({'fill' : '#f3fff3'}).add();
    },
	/**
	 * 包装url
	 */
	wrapUrl : function(options){
		var uri, url,
			site = window.site || '';
		if (typeof options === 'string') {
			uri = options;
		} else {
			options = $.extend({
				uri : '',
				site : '',
				isTimestamp : false
			}, options || {});
			uri = options.uri;
			site = options.site || site;
		}
		uri.indexOf('/') && (uri = '/'+uri);
		url = site + uri;

		if (options.isTimestamp) {		// 是否对url添加时间戳
			url += (~uri.search(/\?/g)?'&':'?') + new Date().getTime();
		}
		return url;
	},
	/**
	 * 简单模板渲染的方法
	 * @param  {Object} property 渲染模板需要用到的参数
	 * @param  {String} tpl      模板字符串
	 * @return {String}          渲染完成后的字符串
	 */
	render : function(property, tpl){
		var _tpl = tpl;
		Object.keys(property).forEach(function(key){
			_tpl = _tpl.replace(eval('/@'+key+'@/g'), property[key]);
		});
		return _tpl;
	},
	extend : $.extend,
	error : function(){
		if (console && typeof console.error === 'function') {
			console.error.apply(console, arguments);
		}
	},
	/**
	 * 个股访问历史
	 */
	history : (function(){
		var name = 'last_visit_history';
		return {
	        get : function(){
	            var cookieData = Cookie.get(name) || '';
	            return cookieData.split('|').filter(function(value){
	                return !!value;
	            });
	        },
	        set : function(symbol){
	            if (!symbol) {
	                return;
	            }
	            var split = this.get();
	            if (split.indexOf(symbol) != -1) {
	                return;
	            }
	            split.unshift(symbol+'');
	            if (split.length > 10) {
	                split = split.slice(-10);
	            }
	            Cookie.set(name, split.join('|'));
	        },
	        del : function(symbol){
	            if (!symbol) {
	                return;
	            }
	            var split = this.get();
	            split = split.filter(function(value){
	                return value!=symbol;
	            });
	            Cookie.set(name, split.join('|'));
	        },
	        clear : function(){
	            Cookie.set(name, '');
	        }
		};
	})(),
	Cookie : Cookie
};

// var _ = require('/modules/util/util');
