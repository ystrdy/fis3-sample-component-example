module.exports = function(selector){
    if (typeof selector !== 'string') {
        throw new Error('组件:Favourite 参数必须为字符串.');
    }

    var fnSet = function(){
        var ua = navigator.userAgent.toLowerCase(),
            url = 'http://' + self.location.host + self.location.pathname + '?fav',
            sitename = document.title,
            vctrl = (navigator.userAgent.toLowerCase()).indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL';
        if (ua.indexOf("msie 8") > -1) {
            external.AddToFavoritesBar(url, sitename, ""); //IE8
        } else {
            try {
                window.external.addFavorite(url, sitename);
            } catch (e) {
                try {
                    window.sidebar.addPanel(sitename, url, ""); //firefox
                } catch (e) {
                    alert('\u60A8\u53EF\u4EE5\u5C1D\u8BD5\u901A\u8FC7\u5FEB\u6377\u952E' + vctrl + ' + D \u52A0\u5165\u5230\u6536\u85CF\u5939!');
                }
            }
        }
        return false;
    };

    if ($(selector).length) {
        $(selector).on('click', function(event){
            fnSet();
            event.preventDefault();
        });
    }
};