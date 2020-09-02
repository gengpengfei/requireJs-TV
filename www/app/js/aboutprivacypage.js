define(['jquery','navigation','text!view/aboutprivacypageView.html','i18n!../nls/language','css!style/settingpage.css'],function($,SN,aboutprivacypageView,language) {
    'use strict';
    //-- 首页初始化布局
    function initHtml (){
        var temp_node = document.createElement('div');
        temp_node.innerHTML = aboutprivacypageView;
        var aboutprivacypage_dom = temp_node.firstChild;
        if(!document.getElementById("aboutprivacypage_container")){
            document.getElementById("container").appendChild(aboutprivacypage_dom);
        }
    }
    function initFocus(){
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'a_privacy',
                selector: '#aboutprivacypage_container .focusable',
                defauleElement:"#defauleElement"
            });
            SN.makeFocusable();
            setTimeout(function(){
                SN.focus("#aboutprivacypage_container .focusable");
            },300)

            $('#aboutprivacypage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                window.history.go(-1);
            });
        })
    }
    function scrollPage (position){
        var scrollItem = document.getElementById("aboutprivacypage_container").querySelector('.clause_scroll');
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
        $('#aboutprivacypage_container .focusable')
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