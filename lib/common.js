require('./mod.js');
require('./jquery-1.8.3.min.js');
require('./highstock.src.js');

window.site = 'http://www.2258.com';		// 设置wrapUrl包装时，返回的基于当前设置站点的url

// 设置主页
require('/modules/SetHome/SetHome')('#set_home_btn');
// 收藏本页
require('/modules/Favourite/Favourite')('#favourite_btn');
// 搜索框
require('/modules/Searchbox/Searchbox')();
// 导航栏
require('/modules/nav/nav')();
// 实时行情
require('/modules/realInformation/realInformation')({
	container : '.realInformation ul'
});