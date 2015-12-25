module.exports = function(selector){
    if (typeof selector !== 'string') {
        throw new Error('组件:SetHome 参数必须为字符串.');
    }
    var fnSet = function(DOMThis){
        var vrl = window.location,
            obj = DOMThis;
        try{
            obj.style.behavior='url(#defaults#homepage)';
            obj.setHomePage(vrl);
        } catch(e){
            if(window.netscape){
                try{
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                    var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
                    prefs.setCharPref('browser.startup.homepage',vrl);
                }catch (e) {
                    alert("该操作被浏览器拒绝,如果想启用该功能,请在地址栏内输入about:config,然后将项signed.applets.codebase_principal_support值改为true");
                }
            }else{
                alert("设为主页失败，该浏览器不支持自动设为主页功能。请手动添加");
            }
        } 
    };

    if ($(selector).length) {
        $(selector).on('click', function(event){
            fnSet(this);
            event.preventDefault();
        });
    }
};