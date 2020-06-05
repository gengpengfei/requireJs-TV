define(['text!view/privacypageView.html','unity/keyDownEvent','i18n!../nls/language'],function(privacypageView,keyDownEvent,language) {
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
        //console.log('privacypage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = privacypageView;
        var privacypage_dom = temp_node.firstChild;
        if(!document.getElementById("privacypage_container")){
            document.getElementById("container").appendChild(privacypage_dom);
        }
    }

    //-- 填充数据
    function fillData() {
        //console.log('privacypage - 数据填充--------->');
        //-- 填充title栏数据
        document.getElementById("p_title").innerHTML = language['Privacy'];
        document.getElementById("p_privacy_clear_data").innerHTML = language['Clear All Browsing Data']
        document.getElementById("p_privacy_clear_cookie").innerHTML = language['Clear All Cookies']
        //-- 初始化焦点
        s_hash_map.get('p_clear').addFocus(1,1);
    }

    function onclickEvent (){
        //console.log('privacypage - 开启鼠标点击监听-------->');
        //-- 判断当前显示页面
        var privacypage_dom = document.getElementById('privacypage_container');
        var focus_doms = privacypage_dom.querySelectorAll('[name="p_focus"]');
        for(var i=0;i<focus_doms.length;i++){
            focus_doms[i].onclick = function(e){
                var focus_id = e.target.id.split('_');
                if(focus_id[0] !== 'p') return false;
                var position = focus_id[0]+'_'+focus_id[1];
                var point_x = parseInt(focus_id[2],10);
                var point_y = parseInt(focus_id[3],10);
                s_hash_map.get(position).focusClick(point_x,point_y);
            }
        }
    }

    var s_hash_map = new Map();
    s_hash_map.set('p_clear',new clearFocusEvent())

    function clearFocusEvent(){
        this.prefix = 'p_clear';

        this.focusUp = function (point_x,point_y){
            return;
        }
        this.focusDown = function(point_x,point_y){
            return;
        }
        this.focusLeft = function(point_x,point_y){
            var new_point_x = point_x - 1;
            if(!this.checkFocus(new_point_x,point_y)) return ;
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
        }
        this.focusRight = function(point_x,point_y){
            var new_point_x = point_x + 1;
            if(!this.checkFocus(new_point_x,point_y)) return ;             
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
        } 
        this.back = function(){
            window.history.go(-1)
        }
        this.focusClick = function(point_x,point_y){
            try{
                if(point_x == 1){
                    new Msg({
                        content:"Clear all browsing data ?",
                        confirm:function(){
                            //-- 对接接口
                            clearAllBrowsingData();
                        }
                    })
                }
                if(point_x == 2){
                    //-- 清空cookie
                    new Msg({
                        content:"Clear all cookies ?",
                        confirm:function(){
                            //-- 对接接口
                            clearAllCookie();
                        }
                    })
                }
                this.removeFocus();
                this.addFocus(point_x,point_y);                
            }catch(e){
                //console.log(e);
            }
        }
        this.checkFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
        }
        this.addFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if(dom) dom.classList.add('active');
        }
        this.removeFocus = function(){
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if(dom) dom.classList.remove('active');
        }
    }

    //-- 添加historypage页面全局监听
    function onkeydownEvent (){
        var keyDown = keyDownEvent.createNew();
        keyDown.bindKey('p_clear', new clearFocusEvent())
    }
    //-- 装载 privacypage模块
    var render = function() {
        initHtml();
        fillData();
    }
    var bind = function(){
        onkeydownEvent();
    }
    var run = function(){
        //onclickEvent();
    }
    return {
        render:render,
        bind:bind,
        run:run
    };
});