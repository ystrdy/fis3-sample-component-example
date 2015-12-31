module.exports = {
    _expires:24*3600*1000,

    _domain: (function(){
        var _gethost = location.host;
        return _gethost.substring(_gethost.indexOf('.'),_gethost.length);
    })(),

    set:function(name,value,expires,path,domain){
        expires=new Date(new Date().getTime()+(expires?expires:this._expires));
        document.cookie=name+"="+escape(value)+";expires="+expires.toGMTString()+";path="+(path?path:"/")+";domain="+(domain?domain:this._domain);
    },

    get:function(name){
        var arr=document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
        if(arr!=null) return unescape(arr[2]);
        return null;
    },

    clear:function(name,path,domain){
        if(this.get(name)) document.cookie=name+"=; path="+(path?path:"/")+"; domain="+(domain?domain:this._domain)+"; expires=Fri, 02-Jan-1970 00:00:00 GMT";
    }
};