define(['js/moduleController'],function(moduleController){
    'use strict';
    //-- 添加searchpage页面全局监听
    var searchpageEvent = {}
    searchpageEvent.onkeydownEvent = function(){
        console.log('searchpage - 开启遥控按下监听-------->');
        document.addEventListener('keydown',function(e){
            e.stopPropagation();
            //-- 判断当前显示页面
            var searchpage_dom = document.getElementById('searchpage_container');
            if(!searchpage_dom.classList.contains('module-block')) return;
            //-- 获取当前页焦点位置
            var element = searchpage_dom.querySelector(".active");
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

    searchpageEvent.onclickEvent = function(){
        console.log('searchpage - 开启鼠标点击监听-------->');
        //-- 判断当前显示页面
        var searchpage_dom = document.getElementById('searchpage_container');
        var focus_doms = searchpage_dom.querySelectorAll('[name="s_focus"]');
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

    //-- 监听 search input 重新弹出键盘或者跳转
    searchpageEvent.inputEvent = function(){
        var search_input = document.getElementById('s_search_input');
        search_input.addEventListener('keydown',function(e){
            if(e.keyCode === 13){
                search_input.blur();
                search_input.focus();
            }
        })
        search_input.addEventListener('keyup',function(e){
            if(e.keyCode === 13){
                var search_data = search_input.value;
                if(search_data){
                    search_input.value = null;
                    //-- 判断用户输入的搜索条件
                    if(isURL(search_data)) window.location.href = 'http://'+search_data;
                    window.location.href = "https://www.baidu.com/s?ie=UTF-8&wd="+search_data
                }
            }
        })
    }

    var s_hash_map = new Map();
    s_hash_map.set('s_search',new searchFocusEvent())
    s_hash_map.set('s_history',new historyFocusEvent())

    //-- 顶部
    function searchFocusEvent(){
        this.prefix = 's_search';

        this.focusUp = function (){
            console.log('up no');
        }

        this.focusDown = function(point_x,point_y){
            try{
                this.removeFocus();
                s_hash_map.get('s_history').initFocus();
                this.blur();
            }catch(e){
                console.log(e);
            }
        }
        
        this.focusLeft = function(point_x,point_y){
            var new_point_x = point_x-1;
            if(!this.checkFocus(new_point_x,point_y)) return;
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
            this.blur();
        }

        this.focusRight = function(point_x,point_y){
            var new_point_x = point_x + 1;
            if(!this.checkFocus(new_point_x,point_y)) return;
            //-- 移除所有焦点
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
            this.blur();
        }

        this.focusClick = function(point_x,point_y){
            //-- 通过移动事件来实现点击事件焦点效果
            this.focusRight(point_x-1,point_y);
            if(point_x === 1){
                console.log('input 获取焦点------------>');
                var input_dom = document.getElementById('s_search_input');
                input_dom.focus();
            }
            if(point_x === 2){
                console.log('渲染二维码弹框------------>');
            }
        }
        this.checkFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
        }
        this.addFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            dom.classList.add('active');
        }
        this.removeFocus = function(){
            var dom = document.getElementById(this.prefix).querySelector(".active")
            if(dom) dom.classList.remove('active');
        }
        this.blur = function(){
            document.getElementById('s_search_input').blur();
        }
    }

    function historyFocusEvent(){
        this.prefix = 's_history';

        this.initFocus = function (){
            var dom = document.getElementById(this.prefix + '_1_1');
            if(!dom) throw 'history is null';
            dom.classList.add('active');
        }
        this.focusUp = function (point_x,point_y){
            try{
                var new_point_y = point_y - 1;
                this.removeFocus();
                if(!this.checkFocus(point_x,new_point_y)){
                    s_hash_map.get('s_search').addFocus(1,1);
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
                var url = dom.getAttribute("url");
                window.location.href = url;
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

    function isURL(domain) {
        var name = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
        if(!(name.test(domain))) return false;
        return true;
    }
    return searchpageEvent;
})
