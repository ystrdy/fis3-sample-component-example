var _ = require('/modules/util/util');

var Search = function(options){
    this.opt = $.extend({
        container : '.searchbox',
        input : '.sb_input',
        droplist : '.droplist',
        noResultClass : '.no_result',
        uri : '/api/search/',
        stockUri : '/a/'
    }, options);

    this.$container = $(this.opt.container);
    this.$input = this.$container.find(this.opt.input);
    this.isNoResult = false;

    this.render = _.render;

    this.init();
};
Search.prototype = {
    HEADER_TPL : '<dt><span>@0@</span><span>@1@</span><span>@2@</span></dt>',
    ITEM_TPL : '<dd data-symbol="@4@"><a href="@3@"><span>@0@</span><span>@1@</span><span>@2@</span></a></dd>',
    NO_RESULT_TPL : '<dd class="@classname@">@msg@</dd>',
    LIST_TPL : '<div class="@classname@">@header@@content@</div>',
    init : function(){
        var $c = this.$container,
            $i = this.$input;
        if (!$c.length || !$i.length) {
            console.error && console.error('Searchbox模块调用出错.');
            return;
        }
        this.eventListener();
    },
    eventListener : function(){
        var self = this,
            $c = this.$container,
            $i = this.$input;

        // 只能将propertychange事件绑定到input上，因为propertychange事件不会冒泡
        $i.on('input propertychange', function(){
            self.showDropList(this);
        }).on('keydown', function(event){
            if (!self.isNoResult) {
                var keyCode = event.keyCode;
                switch(keyCode){
                    case 38 :           // 上方向键
                        self.moveCurSel('up');
                        break;
                    case 40 :           // 下方向键
                        self.moveCurSel('down');
                        break;
                    case 13 :           // enter键
                        self.enterStock(this);
                        break;
                    case 27 :           // ESC键
                        self.removeDropList();
                        break;
                }
                if (keyCode === 38 || keyCode === 40 ||
                    keyCode === 13 || keyCode === 27) {
                    event.preventDefault();                    
                }
            }
        }).on('click', function(event){
            event.stopPropagation();
        });
        // 点击其他地方删除下拉列表
        $(document).on('click', function(){
            self.removeDropList();
        }).on('mouseenter', this.opt.droplist+' dd', function(){
            self.moveCurSel($(this));
        });
    },
    showDropList : function(_this){
        var self = this,
            opt = this.opt,
            $c = this.$container,
            value = _this.value.trim();
        if (value) {
            this.getSearchData(value).done(function(ajaxData){
                ajaxData = JSON.parse(ajaxData);
                var html = self.getRenderHtml(ajaxData, value);
                self.removeDropList();
                if (!!html) {
                    $(html).appendTo($c);
                }
            });
        } else {
            // 删除下拉列表
            this.removeDropList();
        }
    },
    removeDropList : function(){
        var $dl = this.$container.find(this.opt.droplist);
        $dl.length && $dl.remove();
    },
    moveCurSel : function(direction){
        if (typeof direction === 'string') {
            var $c = this.$container,
                $i = this.$input,
                $dl = $c.find(this.opt.droplist),
                $dd = null,
                $cur = null,
                $item = null;
            if ($dl.length) {
                // 修改选中项
                $dd = $dl.find('dd');
                $cur = $dd.filter('.cur');
                if (direction === 'up') {
                    $item = $cur.prev('dd');
                    if (!$item.length) {
                        $item = $dd.last();
                    }
                } else if (direction === 'down') {
                    $item = $cur.next('dd');
                    if (!$item.length) {
                        $item = $dd.first();
                    }
                }
            }
            arguments.callee.call(this, $item);
        } else {
            if (direction && direction.length) {
                direction.addClass('cur').siblings().removeClass('cur');
                // 修改input
                this.$input.get(0).value = direction.find('span').first().text();
            }
        }
    },
    enterStock : function(_this){
        var $dl = this.$container.find(this.opt.droplist),
            $cur, $dd, symbol;
        if ($dl.length) {
            $dd = $dl.find('dd');
            $cur = $dd.filter('.cur');
            symbol = $cur.length ? $cur.attr('data-symbol') : $dd.first().attr('data-symbol');
            window.open(this.opt.stockUri+symbol);
            this.removeDropList();
        }
    },
    getRenderHtml : function(ajaxData, keyword){
        var self = this,
            opt = this.opt,
            type = ajaxData.type,
            data = ajaxData.data,
            headerDataTpl = [],
            itemDataTpl = [],
            isRed = false;      // 是否对相同部分描红
        switch(type){
            case 'name' :   // 搜索名称
                headerDataTpl = ['名称','代码','类型'];
                itemDataTpl = ['name', 'code', 'type'];
                isRed = true;
                break;
            case 'short' :  // 搜索简称
                headerDataTpl = ['简称','名称','类型'];
                itemDataTpl = ['code', 'name', 'type'];
                break;
            case 'code' :   // 搜索代码
                headerDataTpl = ['代码','名称','类型'];
                itemDataTpl = ['code', 'name', 'type'];
                isRed = true;
                break;
        }
        try{
            this.isNoResult = false;
            return this.render({
                classname : opt.droplist.slice(1),
                header : this.render(headerDataTpl, this.HEADER_TPL),
                content : data.reduce(function(prev, item){
                    var itemData = [];
                    itemDataTpl.forEach(function(value, index){
                        // 描红处理
                        var v = item[value],
                            _v = v;
                        if (isRed && !index) {
                            _v = _v.slice(0, keyword.length);
                            if (_v === keyword) {
                                v = v.replace(keyword, '<i>'+keyword+'</i>');
                            }
                        }
                        itemData.push(v);
                    });
                    // 将其他添加到最后
                    itemData.push(self.opt.stockUri+item.symbol);
                    itemData.push(item.symbol);

                    return prev + self.render(itemData, self.ITEM_TPL);
                }, '')
            }, this.LIST_TPL);
        } catch(e){
            this.isNoResult = true;
            return this.render({
                classname : opt.droplist.slice(1),
                header : this.render(headerDataTpl, this.HEADER_TPL),
                content : this.render({
                    classname : opt.noResultClass.slice(1),
                    msg : '未找到相关股票'
                }, this.NO_RESULT_TPL)
            }, this.LIST_TPL);
        }
    },
    getSearchData : function(keyword){
        return $.ajax({
            url : _.wrapUrl(this.opt.uri + keyword)
        });
    }
};
module.exports = function(options){
    return new Search(options);
};