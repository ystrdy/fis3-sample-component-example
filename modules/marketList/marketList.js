/*------------------
Created:2015/12/23
author:xuxufei
email:xuxufei@2144.cn
website:
-----------------*/

module.exports = function(){
	var $container = $('.market_list');
	$container.each(function(){
		var $switcher = $(this).find('.ml_hd a'),
			$panel = $(this).find('.ml_list');
		$(this).on('click', '.ml_hd a', function(event){
			var index = $(this).index();
			$switcher.removeClass('cur').eq(index).addClass('cur');
			$panel.addClass('hidden').eq(index).removeClass('hidden');
		});
	});
};