module.exports = function(){
	var $sharp = $('.n_sharp'),
		$nav = $('.nav'),
		sharpWidth = $sharp.width(),
		navOffsetLeft = $nav.offset().left,
		fnMovePosition = function($this){
			var itemWidth = $this.outerWidth(),
				left = $this.offset().left;
			$sharp.css('left', left - navOffsetLeft + itemWidth / 2 - sharpWidth / 2);
		};
	$nav.on('mouseenter', 'a', function(){
		fnMovePosition($(this));
	}).on('mouseleave', function(){
		fnMovePosition($(this).find('a.cur'));
	});
};