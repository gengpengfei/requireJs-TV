define(['jquery','navigation','text!view/privacypageView.html','i18n!../nls/language','css!style/settingpage.css'],function($,SN,privacypageView,language) {
    'use strict';
    function clearAllCookie(){
        if(window.sraf){
            window.sraf.storage.deleteAllCookies()
        }
        if(window.jsUtil){
            window.jsUtil.deleteAllCookies()
        }
    }
    function clearAllBrowsingData(){
        if(window.sraf){
            window.sraf.storage.deleteUserData()
        }
        if(window.jsUtil){
            window.jsUtil.deleteUserData()
        }
    }

    //-- 首页初始化布局
    function initHtml (){
        var temp_node = document.createElement('div');
        temp_node.innerHTML = privacypageView;
        var privacypage_dom = temp_node.firstChild;
        if(!document.getElementById("privacypage_container")){
            document.getElementById("container").appendChild(privacypage_dom);
        }
    }

    //-- 填充数据
    function fillData() {
        //-- 填充title栏数据
        document.getElementById("p_title").innerHTML = language['privacy-title'];
        document.getElementById("p_privacy_clear_data").innerHTML = language['privacy-clear-browsing']
        document.getElementById("p_privacy_clear_cookie").innerHTML = language['privacy-clear-cookies']
    }
    var hash_map = new Map();
    hash_map.set('p_clear',new clearFocusEvent())

    function clearFocusEvent(){
        this.prefix = 'p_clear';

        this.back = function(){
            window.history.go(-1)
        }
        this.focusClick = function(elem){
            try{
                if(elem.id == 'p_clear_data'){
                    new Msg({
                        content:language['privacy-clear-browsing'] + '?',
                        confirm:function(){
                            //-- 对接接口
                            clearAllBrowsingData();
                            setTimeout(function(){
                                SN.focus()
                            })
                        },
                        cancle:function(){
                            setTimeout(function(){
                                SN.focus()
                            })
                        }
                    })
                }
                if(elem.id == 'p_clear_cookie'){
                    //-- 清空cookie
                    new Msg({
                        content:language["privacy-clear-cookies"] + '?',
                        confirm:function(){
                            //-- 对接接口
                            clearAllCookie();
                            setTimeout(function(){
                                SN.focus()
                            })
                        },
                        cancle:function(){
                            setTimeout(function(){
                                SN.focus()
                            })
                        }
                    })
                }
            }catch(e){
                console.log(e);
            }
        }
    }
    //-- 初始化页面焦点
    function focusInit(){
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'p_clear',
                selector: '#p_clear .focusable',
                straightOnly: true,
                enterTo: 'last-focused'
            });
            
            SN.makeFocusable();
            SN.focus();
        })
    }

    //-- 添加全局 back 监听
    function onBackEvent(){
        $('#privacypage_container .focusable')
        .off('sn:enter-back')
        .on('sn:enter-back', function(e) {
            var sectionId = SN.getSectionId(this)
            hash_map.get(sectionId).back(this);
        });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent (){
        $('#privacypage_container .focusable')
        .off('sn:enter-down')
        .on('sn:enter-down', function(e) {
            var sectionId = SN.getSectionId(this)
            hash_map.get(sectionId).focusClick(this);
        });
    }
    //-- 添加全局的 click 监听
    function onClickEvent(){
        $('#privacypage_container .focusable')
        .off('sn:enter-click')
        .on('sn:enter-click', function() {
            var sectionId = SN.getSectionId(this)
            hash_map.get(sectionId).focusClick(this);
        });
    }
    var render = function(){
        initHtml();
        fillData();
    }
    var addEvent = function(){
        focusInit();
        onEnterEvent();
        onBackEvent();
        if(!window.sraf){
            onClickEvent();
        }
    }
    return {render:render,addEvent:addEvent}
});