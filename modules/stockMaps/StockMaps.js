var rdp = require('/modules/RealDataPool/RealDataPool'),
    _ = require('/modules/util/util');

var StockMap = function(options){
    this.opt = _.extend({
        container : '',
        width : 250,
        height : 129,
        stocks: [{
            name: '上证',
            symbol: 'sh000001',
            current : true
        }, {
            name: '深证',
            symbol: 'sz399001'
        }, {
            name: '创业板',
            symbol: 'sz399006'
        }, {
            name: '中小板',
            symbol: 'sz399005'
        }]
    }, options || {});

    this.$container = null;
    this.stocks = [];
    this.symbols = [];
    this.chart = null;
    this.last_close = 0;

    this.init();
};

StockMap.prototype = {
    init : function(){
        var opt = this.opt,
            $container = this.$container = $(opt.container);
        if (!$container.length) {
            console && console.error('StockMaps组件找到绘图节点.');
            return;
        }

        this.stocks = opt.stocks;
        this.symbols = this.stocks.map(function(item){
            return item.symbol;
        });

        this.create();
    },
    create : function(){
        var $container = this.$container,
            stocks = this.stocks,
            CONT_TPL = '<div class="sm_hd">@items@</div><div class="sm_bd"><div class="smb_meta"></div><div class="smb_draw"></div></div>',
            ITEM_TPL = '<a href="javascript:;" target="_self" class="@classname@">@name@</a>';
        // 创建DOM结构
        $container.html(_.render({
            items : stocks.reduce(function(prev, item){
                return prev + _.render({
                    classname : item.current ? 'cur' : '',
                    name : item.name
                }, ITEM_TPL);
            }, '')
        }, CONT_TPL));
        // 创建图
        var self = this;
        Highcharts.setOptions({
            global: {
                useUTC: false
            }
        });
        new Highcharts.StockChart(this.getConfig(), function(chart){
            self.chart = chart;
            chart.showLoading('加载中...');
            self.update(0);
        });
    },
    update : function(index){
        var stock = this.stocks[index],
            self = this,
            url = '';
        if (!stock) return;
        url = _.wrapUrl('/api/timing/'+stock.symbol, true);
        $.ajax(url).done(function(data){
            data = JSON.parse(data);
            self.updateMeta(data.base);
            self.updateChart(data);
        });
    },
    updateMeta : function(base){
        var TPL = '@name@ <span>@current@</span><span>@change@</span><span>@percentage@</span>',
            $container = this.$container,
            $info = $container.find('.smb_meta');
        try{
            var lastClose = +base.last_close,
                current = +base.current,
                name = base.name,
                change = +base.change,
                percentage = +base.percentage,
                classname = 'smb_meta ',
                arrow = '';

            if (current > lastClose) {
                classname += 'rise';
                arrow = '↑';
            } else if (current < lastClose) {
                classname += 'fall';
                arrow = '↓';
            } else {
                classname += 'equal';
            }

            current = current.toFixed(2);
            change = arrow + change.toFixed(2);
            percentage = arrow + percentage.toFixed(2) + '%';

            $info.html(_.render({
                name : name,
                current : current,
                change : change,
                percentage : percentage
            }, TPL)).attr('class', classname);

        } catch(e){
            // 不处理
        }
    },
    updateChart : function(ajaxData){
        var base = ajaxData.base,
            data = ajaxData.data,
            chart = this.chart,
            seriesData = _.parseData(data);

        this.last_close = +base.last_close;
        chart.series[0].update({
            name : base.name,
            data : _.makeDrawingArray(seriesData)
        });
        chart.hideLoading();
    },
    getConfig : function(){
        var self = this,
            opt = this.opt;
        return {
            chart : {
                renderTo : this.$container.find('.smb_draw').get(0),
                plotBorderWidth : 1,
                plotBorderColor : '#ddd',
                panning : false,
                margin: [6,35,6,1],
                width : opt.width,
                height : opt.height
            },
            credits : _.credits,
            exporting : {
                enabled : false
            },
            legend : {
                enabled : false
            },
            navigator : {
                enabled : false
            },
            scrollbar : {
                enabled : false
            },
            rangeSelector : {
                enabled : false
            },
            tooltip : {
                crosshairs : [true, true],
                xDateFormat : '%Y-%m-%d %H:%M'
            },
            plotOptions : {
                line : {
                    lineWidth : 0.5,
                    lineColor : '#2f6bb5',
                    states : {
                        hover : {
                            enabled : false
                        }
                    },
                    dataGrouping : {
                        enabled : false
                    }
                }
            },
            xAxis : [{
                showEmpty : true,
                lineWidth : 0,
                gridLineWidth : 1,
                gridLineDashStyle : 'ShortDash',
                gridLineColor : '#e8e8e8',
                tickLength : 0,
                tickPositioner : _.xTickPositioner.call(this)
            }],
            yAxis : [{
                gridLineWidth : 1,
                gridLineDashStyle : 'ShortDash',
                gridLineColor : '#e8e8e8',
                showFirstLabel : true,
                showLastLabel : true,
                maxPadding : 0,
                labels : {
                    align : 'left',
                    x : 5,
                    y : 4,
                    style : {
                        color : '#333'
                    },
                    formatter: _.yLabelsFormatter.call(this)
                },
                tickPositioner : _.yTickPositioner.call(this)
            }],
            series : [{
                data : _.makeDrawingArray(_.parseData())
            }]
        };
    }
};

module.exports = function(options){
    return new StockMap(options);
};

/*
var StockMap = function(container){
    this.$container = $(container);
    this.stocks = ['sh000001', 'sz399001', 'sz399006', 'sz399005'];

    this.init();
};
StockMap.prototype = {
    CONTENT_TPL : '<div class="switch"><div class="in">@header@</div></div><div class="zs_con">@tips@<div class="zs_drawing"></div></div>',
    HEADER_ITEM_TPL : '<span class="@classname@">@name@</span>',
    TIPS_TPL : '<div class="zs_tips @class@">@name@ <span>@current@</span><span>@change@</span><span>@percentage@</span></div>',
    init : function(){
        var $c = this.$container;
        if (!$c.length) {
            console && console.error('StockMap模块未找到容器节点.');
            return;
        }
        this.create();
        this.eventListener()
    },
    create : function(){
        var self = this;
        rdp.ajax(this.stocks).done(function(ajaxData){
            // 创建DOM结构
            ajaxData = JSON.parse(ajaxData);
            $c.get(0).innerHTML = self.render({
                header : self.getHeaderHtml(ajaxData),
                tips : self.getTipsHtml()
            }, self.CONTENT_TPL);
            $c.removeClass('loading');
            // 创建图
            self.realChart = new RealChart({
                container : '.zs_drawing',
                stock : self.stocks[0],
                fnChartConfig : self.getConfig()
            });
        }).fail(function(){
            self.errorTips('获取股票基本信息失败.');
        });
    },
    eventListener : function(){
        var self = this,
            $c = this.$container;
        $c.on('click', '.in span', function(){
            var index = $(this).index(),
                _this = this;
            self.realChart.updateChart(self.stocks[index]).done(function(){
                $(_this).addClass('cur').siblings().removeClass('cur');
            });
        }).on('UPDATE_COMPLETE', '.zs_drawing', function(event, data){
            var lineData = data.data;
            if (lineData && lineData.length) {
                $(this).trigger('REAL_UPDATE', [data.base]);
            }
        }).on('REAL_UPDATE', '.zs_drawing', function(event, data){
            var $tips = $c.find('.zs_tips'),
                change = +data.change,
                arrow = change > 0 ? '↑' : change < 0 ? '↓' : '';
            $tips.get(0).outerHTML = self.render({
                'class' : change > 0 ? 'rise' : change < 0 ? 'fall' : '',
                name : data.name,
                current : (+data.current).toFixed(2),
                change : arrow + change.toFixed(2),
                percentage : arrow + (+data.percentage).toFixed(2) + '%'
            }, self.TIPS_TPL);
        }).on('click', '.zs_con', function(){
            var index = $c.find('.in .cur').index(),
                symbol = self.stocks[index];
            if (symbol) {
                window.open('/a/'+symbol);
            }
        });
    },
    getHeaderHtml : function(data){
        var names = [], prop, self = this;
        for(prop in data){
            names.push(data[prop].name);
        }
        return names.reduce(function(prev, name, index){
            return prev + self.render({
                classname : index ? '' : 'cur',
                name : name.trim()
            }, self.HEADER_ITEM_TPL);
        }, '');
    },
    getTipsHtml : function(base){
        return this.render(base || {
            'class' : '',
            name : '----',
            current : '--',
            change : '--',
            percentage : '--'
        }, this.TIPS_TPL);
    },
    getConfig : function(){
        return function(){
            var self = this;
            return {
                chart : {
                    renderTo : this.$container.get(0),
                    plotBorderWidth : 1,
                    plotBorderColor : '#ddd',
                    panning : false,
                    margin: [6,55,6,10]
                },
                credits : this.credits,
                exporting : {
                    enabled : false
                },
                legend : {
                    enabled : false
                },
                navigator : {
                    enabled : false
                },
                scrollbar : {
                    enabled : false
                },
                rangeSelector : {
                    enabled : false
                },
                tooltip : {
                    crosshairs : [true, true],
                    xDateFormat : '%Y-%m-%d %H:%M'
                },
                plotOptions : {
                    line : {
                        lineWidth : 0.5,
                        lineColor : '#2f6bb5',
                        states : {
                            hover : {
                                enabled : false
                            }
                        },
                        dataGrouping : {
                            enabled : false
                        }
                    }
                },
                xAxis : [{
                    showEmpty : true,
                    lineWidth : 0,
                    gridLineWidth : 1,
                    gridLineDashStyle : 'ShortDash',
                    gridLineColor : '#e8e8e8',
                    tickLength : 0,
                    tickPositioner : this.xTickPositioner()
                }],
                yAxis : [{
                    gridLineWidth : 1,
                    gridLineDashStyle : 'ShortDash',
                    gridLineColor : '#e8e8e8',
                    showFirstLabel : true,
                    showLastLabel : true,
                    maxPadding : 0,
                    labels : {
                        align : 'left',
                        x : 10,
                        y : 4,
                        style : {
                            color : '#333'
                        },
                        formatter: this.yLabelsFormatter()
                    },
                    tickPositioner : this.yTickPositioner()
                }],
                series : [{
                    data : this.makeDrawingArray(this.parseData())
                }]
            };
        };
    }
};
module.exports = function(container){
    return new StockMap(container);
};
*/