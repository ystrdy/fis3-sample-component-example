var symbols = {},
    uri = '/api/getBaseList/',
    interval = 3 * 1000,
    tId = -1,
    data = {},
    $d = $(document),
    util = require('/modules/util/util'),
    fnRealRequest = function(){
        var sym = [], prop;
        for(prop in symbols){
            symbols[prop] && sym.push(prop);
        }
        if (sym.length) {
            prototype.ajax(sym).done(function(ajaxData){
                data = JSON.parse(ajaxData);
            }).fail(function(){
                console && console.error('实时数据获取失败.');
            });
        }
    },
    prototype = {
        unique : function(a){
            var result = [], hash = {};
            a.forEach(function(value){
                if (!hash[value]) {
                    result.push(value);
                    hash[value] = true;
                }
            });
            return result;
        },
        set : function(s, unique){
            if (s instanceof Array) {
                if (unique) {
                    s = prototype.unique(s);
                }
                s.forEach(function(value){
                    var sym = symbols[value];
                    symbols[value] = sym ? sym+1 : 1;
                });
            } else {
                arguments.callee.call(this, [s+''], unique);
            }
        },
        del : function(s, unique){
            if (s instanceof Array) {
                if (unique) {
                    s = prototype.unique(s);
                }
                s.forEach(function(value){
                    if (symbols[value] && !--symbols[value]) {
                        delete symbols[value];
                    }
                });
            } else {
                arguments.callee.call(this, [s+'']);
            }
        },
        get : function(s){
            if (s instanceof Array) {
                var result = {};
                prototype.unique(s).forEach(function(value){
                    data[value] && (result[value] = data[value]);
                });
                return result;
            } else {
                return arguments.callee.call(this, [s+'']);
            }
        },
        // 利用参数立即发起一次实时请求
        ajax : function(s){
            if (s instanceof Array) {
                return $.ajax(util.wrapUrl({
                    uri : uri + prototype.unique(s).join(','),
                    isTimestamp : true
                }));
            } else {
                return arguments.callee.call(this, [s+'']);
            }
        }
    };

fnRealRequest();
tId = setInterval(fnRealRequest, interval);

module.exports = {
    set : prototype.set,
    del : prototype.del,
    get : prototype.get,
    ajax : prototype.ajax
};