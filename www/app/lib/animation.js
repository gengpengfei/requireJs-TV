define(['jquery'], function($) {
    $.fn.ensureVertical = function(callback) {
        var $this = $(this).parent();
        var $parent = $this.parent();

        //-- 可视区域
        var scrollContent = $parent.parent();
        //-- 容器的padding
        var contentPaddingTop = parseInt($parent.css("padding-top"));
        var contentPaddingBottom = parseInt($parent.css("padding-bottom"));

        //-- 当前item的宽
        var outerHeight = parseInt($this.outerHeight(true));

        //-- 当前item 距离容器的left距离
        var positionTop = $this.position().top;

        //-- 当前item 距离容器bottom的距离
        var bottom = positionTop + outerHeight + contentPaddingBottom;

        var _transform = $parent.css("transform");
        var scrollTop = _transform == 'none' ? 0 : parseInt(_transform.split(/[, ]+/g)[5]);
        var newOffset;
        if (positionTop < contentPaddingTop) {
            newOffset = scrollTop + (contentPaddingTop - positionTop);
        } else if (bottom > scrollContent.innerHeight()) {
            //-- 获取第一个
            newOffset = scrollContent.innerHeight() + scrollTop - bottom;
        }
        if (newOffset != undefined) {
            var _c = Math.abs(newOffset) - Math.abs(scrollTop);
            if (Math.abs(_c) > 10) {
                $parent.css("transform", "translateY(" + Math.floor(newOffset) + "px)");
            }
        }
        setTimeout(callback.bind(this));
        return this;
    };
    $.fn.ensureHorizontal = function(callback) {
        var $this = $(this).first();
        var $parent = $this.parent();

        //-- 可视区域的宽度
        var scrollContent = $parent.parent();

        //-- 容器的padding
        var contentPaddingLeft = parseInt($parent.css("padding-left"));
        var contentPaddingRight = parseInt($parent.css("padding-right"));

        //-- 当前item的宽
        var outerWidth = parseInt($this.outerWidth(true));

        //-- 当前item 距离容器的left距离
        var positionLeft = $this.position().left;

        //-- 当前item 距离容器right的距离
        var right = positionLeft + outerWidth + contentPaddingRight;

        var _transform = $parent.css("transform");
        var scrollLeft = _transform == 'none' ? 0 : parseInt(_transform.split(/[, ]+/g)[4]);
        var newOffset;
        if (positionLeft < contentPaddingLeft) {
            newOffset = scrollLeft + (contentPaddingLeft - positionLeft);
        } else if (right > scrollContent.innerWidth()) {
            //-- 获取第一个
            newOffset = scrollContent.innerWidth() + scrollLeft - right;
        }

        if (newOffset != undefined) {
            var _c = Math.abs(newOffset) - Math.abs(scrollLeft);
            if (Math.abs(_c) > 10) {
                $parent.css("transform", "translateX(" + Math.floor(newOffset) + "px)");
            }
        }
        setTimeout(callback.bind(this));
        return this;
    };
})