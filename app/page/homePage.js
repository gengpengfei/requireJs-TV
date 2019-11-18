define(['text!view/homepageView.html','model/homepageModel','js/moduleController','js/homepageEvent','i18n!nls/language','css!style/homepage.css'],function(homepageView,homepageModel,moduleController,homepageEvent,language) {
    'use strict';
    //-- 装载homepage模块
    var homepage = {}
    homepage.loadModule = function(){
        try{
            initHtml();
            fillData();
            focusInit();
            homepageEvent.onkeydownEvent();
            homepageEvent.onclickEvent();
            //-- 展示homepage页面
            moduleController.showHomePage()
        }catch(e){
            console.log(e);
        }
    }

    //-- 首页初始化布局
    function initHtml (){
        console.log('homepage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = homepageView;
        var homepage_dom = temp_node.firstChild;
        document.getElementById("container").appendChild(homepage_dom);
    }
    //-- 首页填充数据
    function fillData() {
        console.log('homepage - 数据填充--------->');
        //-- 填充tab栏数据
        document.getElementById("h_tab_1_1").innerHTML = language['Recommended'];
        document.getElementById("h_tab_2_1").innerHTML = language['Bookmarks'];
        document.getElementById("h_search_title").innerHTML = language['Search or enter address'];
        homepageModel.getRecommendedData().then(function(data){
            var recommend_data = data;
            //-- 填充recommended数据
            var recommended_doms = document.getElementById("h_recommended").querySelectorAll('[name="h_focus"]');
            for(var i=0;i<recommended_doms.length; i++){
                var item = recommended_doms[i];
                if(recommend_data[i]){
                    item.innerHTML = '<img class="pointer-events" src="./app/image/'+recommend_data[i].img+'" />';
                    item.setAttribute("url",recommend_data[i].url)
                }else{
                    item.parentNode.removeChild(item)
                }
            }
        })
    }
    //-- 初始化主页焦点
    function focusInit(){
        console.log('homepage - 初始化焦点----------->');
        document.getElementById("h_tab_1_1").classList.add('active');
    }
    return homepage;
});

