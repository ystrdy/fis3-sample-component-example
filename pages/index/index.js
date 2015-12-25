/*------------------
Created:2015/12/23
author:xuxufei
email:xuxufei@2144.cn
website:
-----------------*/
var Slider = require('/modules/Slider/Slider');
// 首屏焦点图
Slider({
	prefix : 'fs',
	isDirect : false
});
// 脚部滚动图
Slider({
	prefix : 'hs',
	isButton : false
});

require('/modules/tabCategorys/tabCategorys')();
require('/modules/globalMarket/globalMarket')();
require('/modules/marketList/marketList')();