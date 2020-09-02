define(['jquery','navigation','text!view/guidepageView.html','i18n!../nls/language','css!style/guidepage.css'],function($,SN,guidepageView,language) {
    'use strict';
    var state = {
        isRender:false
    }
    var hash_map = new Map();
    hash_map.set('g_guide',new guideFocusEvent())

    function guideFocusEvent(){
        this.back = function(){
            window.history.go(-1);
        }
        this.initUserSelect = function(userSelect){
            if(userSelect == 1){
                $(".a-guide-select").addClass("check")
            }
        }
        this.focusClick = function(elem){
            try{
                var id = $(elem).attr('id')
                if(id == 'a_guide_update'){
                    checkUpgrade()
                }
                if(id == 'a_guide_cookies'){
                    window.location.href = "https://www.seraphic-corp.com/cookie-policy"
                }
                if(id == 'a_guide_terms'){
                    window.location.href = "https://www.seraphic-corp.com/terms"
                }
                if(id == 'a_guide_privacy'){
                    window.location.href = "https://www.seraphic-corp.com/privacy"
                }
                if(id == 'a_guide_select'){
                    $("#a_check_select").toggleClass("check");
                    //-- 对接gdpr选择
                    var userSelect = $("#a_check_select").hasClass("check") ? 1 : 0;
                    setUserSelect(userSelect)
                }
            }catch(e){
                console.log(e);
            }
        }
    }

    //-- 首页初始化布局
    function initHtml (){
        //console.log('guidepage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = guidepageView;
        var guidepage_dom = temp_node.firstChild;
        if(!document.getElementById("guidepage_container")){
            document.getElementById("container").appendChild(guidepage_dom);
        }
    }
    //-- 填充文字
    function fillData(){
        document.getElementById("a_title").innerHTML = "OPEN BROWSER";
        if(window.jsUtil){
            $("#a_guide_update").removeClass("display-none")
        }
        
        document.getElementById("a_guide_version").innerHTML = '2.0.6';
        //-- 填充说明
        document.getElementById("a_guide_update_title").innerHTML = language["guide-check-updates"];
        document.getElementById("a_guide_cookies_title").innerHTML = language["guide-cookies-policy"];
        document.getElementById("a_guide_terms_title").innerHTML = language["guide-terms-policy"];
        document.getElementById("a_guide_privacy_title").innerHTML = language["guide-privacy-policy"];
        document.getElementById("a_guide_privacy_select").innerHTML = language["guide-policy-desc"];
        document.getElementById("a_guide_copyright").innerHTML = "Copyright  2015-2020 SERAPHIC. All rights reserved. ";
    }
    //-- 初始化页面焦点
    function focusInit(){
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'a_guide',
                selector: '#a_guide .focusable',
                straightOnly: true,
                enterTo: 'last-focused'
            });

            SN.makeFocusable();
            SN.focus();
        })
    }

    //-- 添加全局 back 监听
    function onBackEvent(){
        $('#guidepage_container .focusable')
        .off('sn:enter-back')
        .on('sn:enter-back', function(e) {
            var sectionId = SN.getSectionId(this)
            hash_map.get(sectionId).back(this);
        });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent (){
        $('#guidepage_container .focusable')
        .off('sn:enter-down')
        .on('sn:enter-down', function(e) {
            console.log("enter")
            var sectionId = SN.getSectionId(this)
            hash_map.get(sectionId).focusClick(this);
        });
    }
    //-- 添加全局的 click 监听
    function onClickEvent(){
        $('#guidepage_container .focusable')
        .off('sn:enter-click')
        .on('sn:enter-click', function() {
            console.log("click")
            var sectionId = SN.getSectionId(this)
            hash_map.get(sectionId).focusClick(this);
        });
    }
    var render = function(){
        initHtml();
        // fillData();
    }
    var addEvent = function(){
        // focusInit();
        // onEnterEvent();
        // onBackEvent();
        // if(!window.sraf){
        //     onClickEvent();
        // }
    }
    return {render:render,addEvent:addEvent}
});