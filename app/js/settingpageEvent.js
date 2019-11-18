define(['js/moduleController'],function(moduleController){
    'use strict';
    //-- 添加settingpage页面全局监听
    var settingpageEvent = {}
    settingpageEvent.onkeydownEvent = function(){
        console.log('settingpage - 开启遥控按下监听-------->');
        document.addEventListener('keydown',function(e){
            e.stopPropagation();
            //-- 判断当前显示页面
            var settingpage_dom = document.getElementById('settingpage_container');
            if(!settingpage_dom.classList.contains('module-block')) return;
            //-- 获取当前页焦点位置
            var element = settingpage_dom.querySelector(".active");
            var focus_id = element.getAttribute("id").split('_');
            if(focus_id[0] !== 's') return false;
            var key_code = e.keyCode;
            var position = focus_id[0]+'_'+focus_id[1];
            var point_x = parseInt(focus_id[2],10);
            var point_y = parseInt(focus_id[3],10);
            //-- up
            if(key_code == 38){
                s_hash_map.get(position).focusUp(point_x,point_y);
            }
            //-- down
            if(key_code == 40){
                s_hash_map.get(position).focusDown(point_x,point_y);
            }
            //-- left 
            if(key_code == 37){
                s_hash_map.get(position).focusLeft(point_x,point_y);
            }
            //-- right
            if(key_code == 39){
                s_hash_map.get(position).focusRight(point_x,point_y);
            }
            //-- enter
            if(key_code == 13){
                s_hash_map.get(position).focusClick(point_x,point_y);
            }
            //-- back
            if(key_code == 147){
                moduleController.showHomePage()
            }
        });
    }

    settingpageEvent.onclickEvent = function(){
        console.log('settingpage - 开启鼠标点击监听-------->');
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

    var s_hash_map = new Map();
    s_hash_map.set('s_setting',new settingFocusEvent())

    function settingFocusEvent(){
        this.prefix = 's_setting';

        this.focusUp = function (point_x,point_y){
            try{
                var new_point_y = point_y - 1;
                this.removeFocus();
                if(!this.checkFocus(point_x,new_point_y)){
                    s_hash_map.get('s_setting').addFocus(1,1);
                }else{
                    s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
                }
            }catch(e){
                console.log(e);
            }
        }

        this.focusDown = function(point_x,point_y){
            var new_point_y = point_y + 1;
            //-- 判断当前焦点下方有没有item ， 如果没有向前取
            var check_point_x = this.getDownFocusPoint(point_x,new_point_y);     
            if(!check_point_x) return ;
            this.removeFocus();
            s_hash_map.get(this.prefix).addFocus(check_point_x,new_point_y);
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
        this.focusClick = function(point_x,point_y){
            try{
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                var router = dom.getAttribute('router');
                switch(router){
                    case 'history':
                        console.log('渲染 setting history 页面 ------------->');
                        moduleController.showHomePage();
                        break;
                    case 'bookmark':
                        moduleController.showHomePage();
                        break;
                    case 'privacy':
                        moduleController.showHomePage();
                        break;
                    case 'account':
                        moduleController.showHomePage();
                        break;
                    case 'security':
                        moduleController.showHomePage();
                        break;
                    case 'about':
                        moduleController.showHomePage();
                        break;
                    case 'exit':
                        moduleController.showHomePage();
                        break;
                }
            }catch(e){
                console.log(e);
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
    return settingpageEvent;
})
