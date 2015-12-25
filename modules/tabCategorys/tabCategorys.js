/*------------------
Created:2015/12/23
author:xuxufei
email:xuxufei@2144.cn
website:
-----------------*/

module.exports = function(){
	var $container = $('.tab_categorys'),
		$switcher = $('.tc_hd a'),
		$panel = $('.tc_list');
	$container.on('click', '.tc_hd a', function(event){
		var index = $(this).index();
		$switcher.removeClass('cur').eq(index).addClass('cur');
		$panel.addClass('hidden').eq(index).removeClass('hidden');
	});
};