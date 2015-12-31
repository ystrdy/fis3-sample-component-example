var Widget = require('/modules/Widget/Widget');

var $window = $(window),
    $html = $('html'),
    $body = $('body'),
    $container = null,
    isCreated = false,
    isWaiting = false,
    loginUrl = '/auth/ajaxlogin',
    forgetUrl = '/auth/forgetstep1',
    registerUrl = '/auth/register',
    showClass = 'over_html',
    const_regexp = {
        account : 'phone|email',
        password : 'pw'
    },
    const_tips = {
        ACCOUNT_ERROR : '请输入正确的手机号/邮箱地址!',
        PASSWORD_ERROR : '密码应为6-14位!'
    },
    speedLoginCfg = window.speedLoginCfg || [],
    speedBtnTpl = '<a href="{{url}}" class="lbs_{{name}}">{{name}}</a>',
    speedLoginTpl = '<div class="lb_speed">' +
                        '<span>快速登录>>></span>{{speedBtn}}' +
                    '</div>',
    template =  '<div class="popup_container">' +
                    '<div class="popup_layer"></div>' +
                    '<div class="login_box">' +
                        '<div class="lb_h">快速登录</div>' +
                        '<a href="javascript:;" target="_self" class="lb_close"></a>' +
                        '<div class="lb_form">' +
                            '<form action="{{loginUrl}}">' +
                                '<dl>' +
                                    '<dd class="lb_tips"></dd>' +
                                    '<dt>账号</dt>' +
                                    '<dd class="lb_edit"><input name="email" placeholder="手机号/邮箱" data-regexp="{{accountRegExp}}" data-error="{{accountErrorTips}}" /><i></i><span></span></dd>' +
                                    '<dt>密码</dt>' +
                                    '<dd class="lb_edit"><input name="password" type="password" data-regexp="{{passwordRegExp}}" data-error="{{passwordErrorTips}}" /><i></i><span></span></dd>' +
                                    '<dd class="lb_opt">' +
                                        '<label for="lb_remember" class="lb_remember"><input type="checkbox" id="lb_remember" name="remember" />下次自动登录</label>' +
                                        '<a href="{{forgetUrl}}" class="lb_forget">忘记密码？</a>' +
                                    '</dd>' +
                                    '<dd class="lb_submit"><input type="submit" value="登录" /></dd>' +
                                    '<dd class="lb_register"><a href="{{registerUrl}}">立即注册</a></dd>' +
                                '</dl>' +
                            '</form>' +
                        '</div>' +
                        '{{speedLogin}}' +
                    '</div>' +
                '</div>',
    prototype = {
        create : function(){
            // 构造模板属性
            var renderProp = {
                    loginUrl : loginUrl,
                    forgetUrl : forgetUrl,
                    registerUrl : registerUrl,
                    speedLogin : '',
                    accountRegExp : const_regexp.account,
                    passwordRegExp : const_regexp.password,
                    accountErrorTips : const_tips.ACCOUNT_ERROR,
                    passwordErrorTips : const_tips.PASSWORD_ERROR
                }, prop, tpl = template, $tpl, temp;
            if (speedLoginCfg.length) {
                renderProp.speedLogin = speedLoginTpl.replace('{{speedBtn}}', speedLoginCfg.reduce(function(prev, item, index){
                    var html = speedBtnTpl, prop, regExp;
                    for(prop in item){
                        html = html.replace(eval('/\{\{'+prop+'\}\}/g'), item[prop]);
                    }
                    return prev + html;
                }, ''));
            }
            // 渲染模板
            for(prop in renderProp){
                tpl = tpl.replace(eval('/\{\{'+prop+'\}\}/g'), renderProp[prop]);
            }
            // 添加弹出层到body
            $container = $(tpl).appendTo($body);
            // 构造复选框
            new Widget.CheckBox('.lb_remember');
            // 启动事件监听
            prototype.eventListener();

            isCreated = true;
        },
        eventListener : function(){
            var $c = $container;
            $c.on('blur', '.lb_edit input', function(){
                prototype.validateInput($(this));
            }).on('submit', 'form', function(event){
                prototype.submitForm($(this));
                event.preventDefault();
            }).on('click', '.lb_close', function(){
                prototype.show(false);
            });
        },
        submitForm : function($form){
            var ret = false, $submit,
            	site = window.site || '';
            $form.find('.lb_edit input').each(function(){
                ret = prototype.validateInput($(this));
            });
            if (ret && !isWaiting) {
                isWaiting = true;
                $submit = $form.find('input[type="submit"]');
                $tips = $form.find('.lb_tips');
                $submit.val('登录中...');
                $tips.text('');
                $.ajax({
                    type : 'POST',
                    dataType : 'json',
                    url : site + loginUrl,
                    data : $form.serialize()
                }).done(function(data){
                    if (data && data.status === 'success') {
                        // 登录成功
                        prototype.show(false);
                    } else {
                        $tips.text(data.message||'');
                    }
                }).fail(function(){
                    $tips.text('登录失败!');
                }).always(function(){
                    $submit.val('登录');
                    isWaiting = false;

                    exports.logined.apply(null, arguments);
                });
            }
        },
        validateInput : function($target){
            var regexp = $target.attr('data-regexp'),
                errorTips = $target.attr('data-error'),
                rules = prototype.parseRules(regexp),
                value = $target.val(),
                $parent = $target.closest('.lb_edit');
            // 验证
            if (!rules.some(function(rule, index){
                return new RegExp(eval(rule)).test(value);
            })) {
                // 未通过验证
                $parent.get(0).className = 'lb_edit n';
                $parent.find('span').text(errorTips);
                return false;
            } else {
                $parent.get(0).className = 'lb_edit y';
                $parent.find('span').text('');
                return true;
            }
        },
        parseRules : function(regexp){
            var split = regexp.split('|'),
                const_regexp = {
                    phone : "/^(0|86|17951)?(13[0-9]|14[57]|15[012356789]|17[0678]|18[0-9]|14[57])[0-9]{8}$/",
                    email : "/^\\w+([-+.]\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$/",
                    pw : "/\\w{4,30}$/"
                }, prop, rules = [];
            split.forEach(function(value, index){
                rules.push(const_regexp[value]||value);
            });
            return rules;
        },
        show : function(flag){
            if (flag === false) {
                $html.removeClass(showClass)
            } else {
                if (!isCreated) {
                    prototype.create();
                }
                $html.addClass(showClass);
                $container.css('top', $window.scrollTop());
            }
        }
    };

exports.show = prototype.show;

exports.logined = function(){};