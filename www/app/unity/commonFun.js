define( function() {
    'use strict';
    //-- 设置Date格式化函数
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    function maxzIndex(){
        var modules = document.querySelectorAll("[module]");
        var arr = new Array();
        for(var i=0; i<modules.length; i++){
            var zIndex = modules[i].style.zIndex || 0;
            if(zIndex == 'auto') zIndex = 0
            arr.push(zIndex);
        }
        return  parseInt(Math.max.apply(null, arr)) || 0;
    }

    function isURL(domain) {
        var name = /^((https|http){0,1}(:\/\/){0,1})(www\.){0,1}(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])*/;
        if(!(name.test(domain))) return false;
        return true;
    }
    
    function locationPush(url){
        if(url) window.location.href = url;
    }

    //-- 获取图片对应的大小
    function getImageL(){
        var body_width = document.body.scrollWidth;
        if(body_width > 1920){
            return 'big';
        }else if(body_width > 1280 && body_width <= 1920){
            return 'medium';
        }else{
            return 'small';
        }
    }
    return {
        maxzIndex:maxzIndex,
        isURL:isURL,
        locationPush:locationPush,
        getImageL: getImageL
    }
});
