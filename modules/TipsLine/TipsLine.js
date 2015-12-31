var _ = require('/modules/util/util');

function TipsLine(container){
    this.$container = $(container);
    this.$content = null;
    this.render = _.render;
    this.tId = -1;
    this.interval = 5 * 1000;
}
TipsLine.prototype = {
    CONTENT_TPL : '<div class="tips_line"></div>',
    MESSAGE_TPL : '@message@<i>×</i>',
    eventListener : function(){
        var self = this,
            $content = this.$content;
        $content.on('click', 'i', function(){
            self.hide();
        });
    },
    show : function(msg){
        if (typeof msg === 'string') {
            var $con = this.$content;
            if (!$con) {
                $con = this.$content = $(this.render({}, this.CONTENT_TPL)).appendTo(this.$container);
                this.eventListener();
            }
            clearTimeout(this.tId);
            $con.hide().html(this.render({
                message : msg
            }, this.MESSAGE_TPL)).slideDown();
            this.tId = setTimeout(function(){
                $con.hide();
            }, this.interval);
        }
    },
    hide : function(){
        clearTimeout(self.tId);
        this.$content && this.$content.slideUp();
    }
};

module.exports = TipsLine;