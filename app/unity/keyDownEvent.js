define(['unity/hashRouter'],function(hashRouter) {
    'use strict';
    //-- 定义路由类
    var keyDownEvent = {

        hashMap:new Map(),

        createNew: function(){
            var keyDownClass = {};
            
            //-- 加载页面遥控事件绑定
            keyDownClass.bindKey = function(key,obj){
                keyDownEvent.hashMap.set(key,obj);
            }

            //-- 移除页面遥控事件绑定
            keyDownClass.removeKey = function(key){
                keyDownEvent.hashMap.delete(key)
            }

            keyDownClass.callback = function(e) {
                e.stopPropagation();
                e.preventDefault();
                var hashMap = this;
                var key_code = e.keyCode;
                //-- 获取当前页焦点位置
                var element = document.querySelector('.module-block').querySelector(".active");
                var focus_id = element.getAttribute("id").split('_');
                var position = focus_id[0]+'_'+focus_id[1];
                var point_x = parseInt(focus_id[2], 10);
                var point_y = parseInt(focus_id[3], 10);
                //-- up
                if (key_code == 38) {
                    hashMap.get(position).focusUp(point_x, point_y);
                }
                //-- down
                if (key_code == 40) {
                    hashMap.get(position).focusDown(point_x, point_y);
                }
                //-- left
                if (key_code == 37) {
                    hashMap.get(position).focusLeft(point_x, point_y);
                }
                //-- right
                if (key_code == 39) {
                    hashMap.get(position).focusRight(point_x, point_y);
                }
                //-- enter
                if (key_code == 13) {
                    hashMap.get(position).focusClick(point_x, point_y);
                }
                //-- back
                if (key_code == 147 || key_code == 219 || key_code == 27 || key_code == 8) {
                    hashMap.get(position).back(point_x, point_y);
                }
            }
            //-- 添加全局监听
            keyDownClass.addEvent = function(){
                document.addEventListener('keydown',keyDownClass.callback.bind(keyDownEvent.hashMap));
            }
            return keyDownClass;
        }
    };
    return keyDownEvent;
});