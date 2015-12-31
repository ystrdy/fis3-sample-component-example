/**
 * 复选框
 */
exports.CheckBox = function(containerClass){
    var $c = $(containerClass),
        $i = $('input', $c);
    if (!$c.length || !$i.length) {
        console.error('复选框错误!');
        return;
    }
    $c.on('click', function(){
        var v = !!$i.attr('checked');
        $i.attr('checked', !v);
        if (v) {
            $(this).removeClass('cur');
        } else {
            $(this).addClass('cur');
        }
    });
};