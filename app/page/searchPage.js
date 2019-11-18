define(['text!view/searchpageView.html','js/searchpageEvent','js/moduleController','i18n!../nls/language','css!style/searchpage.css'],function(searchpageView,searchpageEvent,moduleController,language) {
    'use strict';
    //-- 装载 searchpage模块
    var searchpage = {}
    searchpage.loadModule = function(){
        try{
            initHtml();
            fillData();
            focusInit();
            searchpageEvent.onkeydownEvent();
            searchpageEvent.onclickEvent();
            searchpageEvent.inputEvent();
            //-- 展示homepage页面
            moduleController.showSearchPage()
        }catch(e){
            console.log(e);
        }
    }
    
    //-- 首页初始化布局
    function initHtml (){
        console.log('searchpage - 初始化页面布局-------->');
        let temp_node = document.createElement('div');
        temp_node.innerHTML = searchpageView;
        var searchpage_dom = temp_node.firstChild;
        document.getElementById("container").appendChild(searchpage_dom);
    }

    //-- 首页填充数据
    function fillData() {
        console.log('searchpage - 数据填充--------->');
        //-- 填充search input 数据
        document.getElementById("s_search_input").setAttribute('placeholder',language['Search or enter address']);

        //-- 填充 history 数据
        var history_data = [];
        var ob_plugin = document.getElementById('sraf_config_sraf');
        if (ob_plugin){
            history_data = ob_plugin.getHistory();
        }
        //-- 测试数据
        history_data = [{url:'https://www.baidu.com',name:'baidu.com'},{url:'https://fanyi.baidu.com/?search=12312323&&aa=111',name:'https://fanyi.baidu.com/?search=12312323&&aa=111'},{url:'https://www.baidu.com',name:'baidu.com'},{url:'https://fanyi.baidu.com/',name:'fanyi.baidu.com'}]
        var history_doms = document.getElementById("s_history").querySelectorAll('[name="s_focus"]');
        for(var i=0;i<history_doms.length; i++){
            var item = history_doms[i];
            if(history_data[i]){
                item.setAttribute("url",history_data[i].url)
                item.innerHTML = history_data[i].name
            }else{
                item.parentNode.removeChild(item)
            }
        }              
    }
    //-- 初始化主页焦点
    function focusInit(){
        console.log('searchpage - 初始化焦点----------->');
        document.getElementById("s_search_1_1").classList.add('active');
    }
    return searchpage;
});