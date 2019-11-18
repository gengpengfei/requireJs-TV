define(['text!view/settingpageView.html','js/settingpageEvent','js/moduleController','i18n!../nls/language','css!style/settingpage.css'],function(settingpageView,settingpageEvent,moduleController,language) {
    'use strict';
    //-- 装载 settingpage模块
    var settingpage = {}
    settingpage.loadModule = function(){
        try{
            initHtml();
            fillData();
            focusInit();
            settingpageEvent.onkeydownEvent();
            settingpageEvent.onclickEvent();
            // //-- 展示homepage页面
            moduleController.showSettingPage()
        }catch(e){
            console.log(e);
        }
    }
    
    //-- 首页初始化布局
    function initHtml (){
        console.log('settingpage - 初始化页面布局-------->');
        let temp_node = document.createElement('div');
        temp_node.innerHTML = settingpageView;
        var settingpage_dom = temp_node.firstChild;
        document.getElementById("container").appendChild(settingpage_dom);
    }

    //-- 填充数据
    function fillData() {
        console.log('settingpage - 数据填充--------->');
        //-- 填充title栏数据
        document.getElementById("s_title").innerHTML = language['Settings'];
        //-- 填充setting 栏数据
        var setting_list = document.getElementsByClassName('s-setting-title');
        setting_list[0].innerHTML = language['History'];
        setting_list[1].innerHTML = language['Bookmarks'];
        setting_list[2].innerHTML = language['Privacy'];
        setting_list[3].innerHTML = language['Account'];
        setting_list[4].innerHTML = language['Security'];
        setting_list[5].innerHTML = language['About'];
        setting_list[6].innerHTML = language['Exit'];          
    }
    //-- 初始化主页焦点
    function focusInit(){
        console.log('settingpage - 初始化焦点----------->');
        document.getElementById("s_setting_1_1").classList.add('active');
    }
    return settingpage;
});