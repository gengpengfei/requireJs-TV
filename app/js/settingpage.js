define(['text!view/settingpageView.html','unity/keyDownEvent','i18n!nls/language'],function(settingpageView,keyDownEvent,language) {
        //-- 首页初始化布局
        function initHtml() {
            var temp_node = document.createElement('div');
            temp_node.innerHTML = settingpageView;
            var settingpage_dom = temp_node.firstElementChild;
            if(!document.getElementById("settingpage_container")){
                document.getElementById("container").appendChild(settingpage_dom);
            }
        }
        //-- 填充数据
        function fillData() {
            //console.log('settingpage - 数据填充--------->');
            //-- 填充title栏数据
            document.getElementById("s_title").innerHTML = language['Settings'];
            //-- 填充setting 栏数据
            var setting_list = document.getElementsByClassName('s-setting-title');
            setting_list[0].innerHTML = language['History'];
            setting_list[1].innerHTML = language['Bookmarks'];
            setting_list[2].innerHTML = language['Privacy'];
            // setting_list[3].innerHTML = language['Account'];
            setting_list[3].innerHTML = language['Security'];
            setting_list[4].innerHTML = language['About'];        
        }
        //-- 初始化主页焦点
        function focusInit(){
            //-- 判断当前页面是否已经有焦点
            var container = document.getElementById('settingpage_container');
            if(container.querySelector('.active')) return;
            //console.log('settingpage - 初始化焦点----------->');
            document.getElementById("s_setting_1_1").classList.add('active');
        }

        var s_hash_map = new Map();
        s_hash_map.set('s_setting',new settingFocusEvent());

        function settingFocusEvent(){
            this.prefix = 's_setting';
            this.focusUp = function (point_x,point_y){
                try{
                    var new_point_y = point_y - 1;
                    if(this.checkFocus(point_x,new_point_y)){
                        this.removeFocus();
                        this.addFocus(point_x,new_point_y);
                    }
                }catch(e){
                    //console.log(e);
                }
            }

            this.focusDown = function(point_x,point_y){
                var new_point_y = point_y + 1;
                //-- 判断当前焦点下方有没有item ， 如果没有向前取
                var check_point_x = this.getDownFocusPoint(point_x,new_point_y);     
                if(!check_point_x) return ;
                this.removeFocus();
                this.addFocus(check_point_x,new_point_y);
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
            this.back = function(point_x,point_y){
                window.history.go(-1);
            }
            this.focusClick = function(point_x,point_y){
                try{
                    var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                    var router = dom.getAttribute('router');
                    switch(router){
                        case 'history':
                            window.location.href='#historypage'
                            break;
                        case 'bookmark':
                            window.location.href='#bookmarkpage'
                            break;
                        case 'privacy':
                            window.location.href='#privacypage'
                            break;
                        case 'account':
                            window.location.href='#accountpage'
                            break;
                        case 'security':
                            window.location.href='#securitypage'
                            break;
                        case 'about':
    
                            break;
                    }
                }catch(e){
                    //console.log(e);
                }
            }
            this.getDownFocusPoint = function(point_x,point_y){
                if(!this.checkFocus(point_x,point_y)){
                    point_x -= 1
                    if(point_x < 1) return false;
                    return this.getDownFocusPoint(point_x,point_y);
                }else{
                    return point_x;
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

        function onclickEvent (){
            //-- 判断当前显示页面
            var settingpage_dom = document.getElementById('settingpage_container');
            var focus_doms = settingpage_dom.querySelectorAll('[name="s_focus"]');
            for(var i=0;i<focus_doms.length;i++){
                focus_doms[i].onclick = function(e){
                    var focus_id = e.target.id.split('_');
                    if(focus_id[0] !== 's') return false;
                    var position = focus_id[0]+'_'+focus_id[1];
                    var point_x = parseInt(focus_id[2],10);
                    var point_y = parseInt(focus_id[3],10);
                    s_hash_map.get(position).focusClick(point_x,point_y);
                }
            }
        }
        //-- 添加settingpage页面全局监听
        function onkeydownEvent (){
            var keyDown = keyDownEvent.createNew();
            keyDown.bindKey('s_setting',new settingFocusEvent());
        }

        //-- 装载 settingpage模块
        var render = function (){
            initHtml();
            fillData();
            focusInit();
        }
        var bind = function(){
            onkeydownEvent();
        }
        var run = function(){
            onclickEvent();
        }
        return {
            render:render,
            bind:bind,
            run:run,
        };
    })