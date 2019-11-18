define(function(){
    'use strict';
    var moduleController = {};

    moduleController.showHomePage = function(){
        try{
            moduleController.closeAllPage();
            var homepage_dom = document.getElementById("homepage_container")
            if(homepage_dom){
                homepage_dom.classList.add('module-block');
            }
        }catch(e){
            console.log(e);
        }
    }
    moduleController.showSearchPage = function(){     
        try{
            moduleController.closeAllPage();
            var searchpage_dom = document.getElementById("searchpage_container")
            if(searchpage_dom){
                searchpage_dom.classList.add('module-block');
            }
        }catch(e){
            console.log(e);
        }
    }
    moduleController.showSettingPage = function(){
        try{
            moduleController.closeAllPage();
            var settingpage_dom = document.getElementById("settingpage_container")
            if(settingpage_dom){
                settingpage_dom.classList.add('module-block');
            }
        }catch(e){
            console.log(e);
        }
    }
    //-- 关闭其它页面
    moduleController.closeAllPage = function(){
        var close_element = document.getElementById('container').querySelector(".module-block");
        if(close_element)  close_element.classList.remove('module-block');
    }
    return moduleController
})