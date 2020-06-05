define(['text!view/historypageView.html','unity/keyDownEvent','i18n!../nls/language'], function (historypageView,keyDownEvent, language) {
    'use strict';
    //-- 装载 historypage模块
    if (window.sraf) {
        window.sraf.addEventListener("query_history", getHistoryByLinux);
    }
    function getHistoryByLinux(e){
        var data = e.slice(0,100);
        fillHistory(data);
    }

    function getHistory (){
        try{
            if(window.sraf){
                sraf.storage.queryHistory("",0);
            }
            if(window.jsUtil){
                var data = window.jsUtil.queryHistory(0,100);
                fillHistory(JSON.parse(data));
            }
        }catch(e){
            // console.log(e);
        }
    }
    function historyDelete(dom){
        var url = dom.getAttribute('url');
        var time = dom.getAttribute('time');
        if (window.sraf) {
            window.sraf.storage.deleteHistory(url,parseFloat(time))
        }
        if (window.jsUtil) {
           //-- 暂时无法实现  
           window.jsUtil.deleteHistoryByUrl(url);
        }
    }
    function clearAllHistory(){
        if (window.sraf) {
            window.sraf.storage.deleteAllHistory();
        }
        if (window.jsUtil) {
            window.jsUtil.clearHistory();
        }
    }
    //-- 首页初始化布局
    function initHtml() {
        //console.log('historypage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = historypageView;
        var historypage_dom = temp_node.firstElementChild;
        if(!document.getElementById("historypage_container")){
            document.getElementById("container").appendChild(historypage_dom);
        }
    }

    //-- 填充数据
    function fillData() {
        //console.log('historypage - 数据填充--------->');
        //-- 填充title栏数据
        document.getElementById("his_title").innerHTML = language['History'];
        //-- 填充无痕浏览说明
        // document.getElementById("his_history_browse_title").innerHTML = language['SeamlessBrowsingMode'];
        document.getElementById("his_history_clear_title").innerHTML = language['Clear History']
    }
    function fillHistory(data){
        //-- 填充history 栏数据
        var html = '';
        //-- 此处为了后期优化，按天显示历史记录
        var list = {};
        for (var i = 0; i < data.length; i++) {
            data[i]['index'] = i + 1;
            var time = data[i]['time'] ? data[i]['time'].toString().substr(0,13) : null;
            data[i]['times'] = time;
            var date = time ? new Date(parseInt(time)).format("yyyy-MM-dd"): '0000-00-00';
            if(!list[date]){
                list[date] = [data[i]];
            }else{
                list[date].push(data[i])
            }       
        }
        Object.keys(list).forEach(function(i){
            for(var e=0;e < list[i].length ; e++){
                var url = list[i][e]['url'];
                var title = list[i][e]['title'];
                var time = list[i][e]['time'];
                var times = list[i][e]['times'];
                var index = list[i][e]['index'];
                times = times ? new Date(parseInt(times)).format("MM/dd hh:mm") : '00/00 00:00';
                //-- 截取域名和域名首字母
                var domain = url.replace(/(http|https):\/\//g, '').split("/")[0];
                var le = domain.replace(/www./g, '').split(".")[0];
                var begins;
                if(le){
                    begins = le.substr(0, 1).toUpperCase();
                }else{
                    begins = '?';
                }
                html += '<div class="his-history-item">'
                html +=     '<div class="his-history-li row-start" name="his_focus" time="'+ time +'" url="' +url + '" id="his_history_1_' + index + '">'
                html +=         '<div>' + times + '</div><div>' + begins + '</div><div>' + url + '</div><div>' + title + '</div>'
                html +=     '</div>'
                html +=     '<div class="his-history-del row-center" name="his_focus" id="his_history_2_' + index + '"><img src="image/common/delete.webp"/></div>'
                html += '</div>';
            }
        })
        var history_list = document.getElementById('his_history');
        history_list.innerHTML = html;
        initFocus();
    }

    var s_hash_map = new Map()
    s_hash_map.set('his_history', new historyFocusEvent())
    s_hash_map.set('his_clear', new clearFocusEvent())

    function historyFocusEvent() {
        this.prefix = 'his_history';
        this.offset = 0;
        this.initFocus = function () {
            try {
                var container = document.getElementById("his_history");
                var new_point = container.firstElementChild.firstElementChild.getAttribute("id")
                var point_x = new_point.split('_')[2];
                var point_y = new_point.split('_')[3];
                s_hash_map.get(this.prefix).addFocus(point_x, point_y);
            } catch (e) {
                console.log(e);
            }
        }
        this.focusUp = function (point_x, point_y) {
            try {
                this.removeFocus();
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if (!dom.parentNode.previousElementSibling) {
                    s_hash_map.get('his_clear').addFocus(1, 1);
                } else {
                    var new_point = dom.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
                    var new_point_y = new_point.split('_')[3];
                    this.historyOffset(point_x, new_point_y);
                    s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
                }
            } catch (e) {
                // console.log(e);
            }
        }

        this.focusDown = function (point_x, point_y) {
            //-- 判断当前焦点下方的item
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if (!dom.parentNode.nextElementSibling) return;
            var new_point = dom.parentNode.nextElementSibling.firstElementChild.getAttribute('id');
            var new_point_y = new_point.split('_')[3];
            this.historyOffset(point_x, new_point_y);
            this.removeFocus();
            s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
        }
        this.focusLeft = function (point_x, point_y) {
            var new_point_x = point_x - 1;
            if (!this.checkFocus(new_point_x, point_y)) return;
            this.removeFocus();
            this.addFocus(new_point_x, point_y);
        }

        this.focusRight = function (point_x, point_y) {
            var new_point_x = point_x + 1;
            if (!this.checkFocus(new_point_x, point_y)) return;
            this.removeFocus();
            this.addFocus(new_point_x, point_y);
        }
        this.back = function(point_x,point_y){
            window.history.go(-1);
        }
        this.focusClick = function (point_x, point_y) {
            try {
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if (point_x == 1) {
                    //-- 跳转
                    var url = dom.getAttribute("url");
                    if(url){
                        window.location.href = url;
                    }
                }
                if (point_x == 2) {
                    if (dom.parentNode.nextElementSibling) {
                        //-- 向下删除
                        //-- 判断当前焦点下方的item
                        var new_point = dom.parentNode.nextElementSibling.firstElementChild.getAttribute('id');
                        var new_point_y = new_point.split('_')[3];
                        this.removeFocus();
                        s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
                    } else if (dom.parentNode.previousElementSibling) {
                        //-- 向上删除
                        var new_point = dom.parentNode.previousElementSibling.firstElementChild.getAttribute('id');
                        var new_point_y = new_point.split('_')[3];
                        //-- 删除时需要同时改变偏移量
                        if (this.offset > 0) {
                            this.offsetType('up');
                        }
                        this.removeFocus();
                        s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
                    } else {
                        //-- 删完了
                        s_hash_map.get('his_clear').addFocus(1, 1);
                    }
                    //-- 对接终端数据
                    var dom = document.getElementById(this.prefix + '_1_' + point_y);
                    historyDelete(dom);
                    dom.parentNode.parentNode.removeChild(dom.parentNode);
                }
            } catch (e) {
                //console.log(e);
            }
        }
        this.historyOffset = function (point_x, point_y) {
            var child = document.getElementById(this.prefix + '_' + point_x + '_' + point_y).parentNode
            var i = 0;
            while ((child = child.previousElementSibling) != null) i++;
            if (i - this.offset > 7) {
                this.offsetType('down');
            }
            if (i - this.offset < 0) {
                this.offsetType('up');
            }
        }
        this.offsetType = function (type) {
            if (type === 'down') {
                this.offset += 1;
            } else if (type === 'up') {
                this.offset -= 1;
            } else {
                return false;
            }
            //-- 计算偏移
            var history_offset = '-' + this.offset * 6.9 + 'vh';
            var history_item = document.getElementById('his_history');
            history_item.style.webkitTransform = "translateY(" + history_offset + ")";
        }
        this.checkFocus = function (point_x, point_y) {
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
        }
        this.addFocus = function (point_x, point_y) {
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if (dom) {
                dom.classList.add('active');
                //-- 同时添加父元素类名
                dom.parentNode.classList.add('transform-focus');
            }
        }
        this.removeFocus = function () {
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if (dom) {
                dom.classList.remove('active');
                //-- 同时移除父元素类名
                dom.parentNode.classList.remove('transform-focus');
            }
        }
    }

    function clearFocusEvent() {
        this.prefix = 'his_clear';

        this.focusUp = function (point_x, point_y) {

        }

        this.focusDown = function (point_x, point_y) {
            //-- 判断当前焦点下方有没有item ， 如果没有焦点不动
            if (!document.getElementById('his_history').hasChildNodes()) return;
            try {
                this.removeFocus();
                s_hash_map.get('his_history').initFocus();
            } catch (e) {
                console.log(e);
            }
        }
        this.focusLeft = function (point_x, point_y) {
            
        }
        this.focusRight = function (point_x, point_y) {

        }
        this.back = function(point_x,point_y){
            window.history.go(-1);
        }
        this.focusClick = function (point_x, point_y) {
            try {
                this.removeFocus();
                this.addFocus(point_x, 1);
                s_hash_map.get("his_history").removeFocus();
				
                if (point_x == 1) {
                    console.log("清空历史记录");
                    new Msg({
                        content:"Clear All History ?",
                        confirm:function(){
                            //-- 底层接口对接
                            try{
                                clearAllHistory();
                                document.getElementById("his_history").innerHTML = null;
                            }catch(e){
                                console.log(e);
                                return;
                            }
                        }
                    })
                }
            } catch (e) {
                //console.log(e);
            }
        }
        this.checkFocus = function (point_x, point_y) {
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
        }
        this.addFocus = function (point_x, point_y) {
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if (dom) dom.classList.add('active');
        }
        this.removeFocus = function () {
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if (dom) dom.classList.remove('active');
        }
    }
    //-- 鼠标点击监听
    function onclickEvent() {
        //console.log('historypage - 开启鼠标点击监听-------->');
        //-- 判断当前显示页面
        var historypage_dom = document.getElementById('historypage_container');
        var focus_doms = historypage_dom.querySelectorAll('[name="his_focus"]');
        for (var i = 0; i < focus_doms.length; i++) {
            focus_doms[i].onclick = function (e) {
                var focus_id = e.target.id.split('_');
                if (focus_id[0] != 'his') return false;
                var position = focus_id[0] + '_' + focus_id[1];
                var point_x = parseInt(focus_id[2], 10);
                var point_y = parseInt(focus_id[3], 10);
                s_hash_map.get(position).focusClick(point_x, point_y);
            }
        }
    }

    //-- 添加historypage页面全局监听
    function onkeydownEvent (){
        var keyDown = keyDownEvent.createNew();
        keyDown.bindKey('his_history', new historyFocusEvent())
        keyDown.bindKey('his_clear', new clearFocusEvent())
    }
    function initFocus(){
        //-- 判断当前页面是否已经有焦点
        var content = document.getElementById("historypage_container");
        if(content.querySelector('.active')) return;
        try {
            var container = document.getElementById("his_history");
            if (!container.hasChildNodes()){
                s_hash_map.get('his_clear').addFocus(1, 1);
            }else{
                var new_point = container.firstElementChild.firstElementChild.getAttribute("id")
                var point_x = new_point.split('_')[2];
                var point_y = new_point.split('_')[3];
                s_hash_map.get("his_history").addFocus(point_x, point_y);
            }
        } catch (e) {
            console.log(e);
        }
    }
    var render = function() {
        try {
            initHtml();
            fillData();
            if (window.sraf || window.jsUtil) {
                getHistory();
            } else {
                //-- 测试
                // var data = [
                //     { 'time': '1584614785968', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584604785968.808105', 'url': 'http://www.booking.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584514785968.808105', 'url': 'http://www.goole.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584414785968.808105', 'url': 'http://www.bbc.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584314785968.808105', 'url': 'http://www.lanhuapp.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584214785968.808105', 'url': 'http://www.fanyi.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584114785968.808105', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1584014785968.808105', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1583614785968.808105', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1582614785968.808105', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                //     { 'time': '1581614785968.808105', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                // ];
                var data = '[{"id":10,"time":1590395959750,"title":"Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"}]';
                data = JSON.parse(data);
                fillHistory(data);
            }
        } catch (e) {
            console.log(e);
        }
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
        run:run,
    };
});