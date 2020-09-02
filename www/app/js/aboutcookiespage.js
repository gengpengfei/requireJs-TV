define(['jquery','navigation','text!view/aboutcookiespageView.html','i18n!../nls/language','css!style/settingpage.css'],function($,SN,cookiespageView,language) {
    'use strict';
    //-- 首页初始化布局
    function initHtml (){
        var temp_node = document.createElement('div');
        temp_node.innerHTML = cookiespageView;
        var cookiespage_dom = temp_node.firstChild;
        if(!document.getElementById("aboutcookiespage_container")){
            document.getElementById("container").appendChild(cookiespage_dom);
        }
    }
    function initFocus(){
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'a_cookies',
                selector: '#aboutcookiespage_container .focusable',
            });
            SN.makeFocusable();
            //-- 此处异步是因为滚动条会默认获取焦点，导致 SN.focus 设置无效
            setTimeout(function(){
                SN.focus("#aboutcookiespage_container .focusable");
            },300)

            $('#aboutcookiespage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                window.history.go(-1);
            });
        })
    }
    function scrollPage (position){
        var scrollItem = document.getElementById("aboutcookiespage_container").querySelector('.clause_scroll');
        var hScrollTop = scrollItem.scrollTop;
        var hScrollHeight = scrollItem.scrollHeight;
        var height = scrollItem.offsetHeight;
        if(position == 'up'){
            if(hScrollTop < 0){
                return;
            }else{
                var h = hScrollTop - height;
                scrollItem.scrollTop = h;
            }
        }
        if(position == 'down'){
            if(hScrollTop + height >= hScrollHeight){
                return;
            }else{
                var h = hScrollTop + height;
                scrollItem.scrollTop = h;
            }
        }
    }
    //-- 添加全局 back 监听
    function onBackEvent(){
        $('#aboutcookiespage_container .focusable')
        .off('keydown')
        .on('keydown', function(e) {
            var keyCode = e.keyCode;
            e.stopPropagation();
            e.preventDefault();
            //-- back 461
            if(keyCode == 461 || keyCode == 147 || keyCode == 219 || keyCode == 27 || keyCode == 8){
                window.history.go(-1);
                return false;
            }
            //-- up
            if(keyCode == 38){
                scrollPage('up');
                return false;
            }
            //-- down
            if(keyCode == 40){
                scrollPage('down');
                return false;
            }
        });
    }
    var render = function(){
        initHtml();
        initFocus();
    }
    var addEvent = function(){
        onBackEvent();
    }
    return {render:render,addEvent:addEvent}
});