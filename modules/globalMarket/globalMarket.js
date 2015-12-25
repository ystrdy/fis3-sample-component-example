/*------------------
Created:2015/12/23
author:xuxufei
email:xuxufei@2144.cn
website:
-----------------*/

module.exports = function(){
	var $container = $('.global_market'),
		$switcher = $('.gm_head a'),
		$panel = $('.gm_list');
	$container.on('click', '.gm_head a', function(event){
		var index = $(this).index();
		$switcher.removeClass('cur').eq(index).addClass('cur');
		$panel.addClass('hidden').eq(index).removeClass('hidden');
	});
};