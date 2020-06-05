define(['text!view/bookmarkpageView.html', 'unity/keyDownEvent', 'i18n!../nls/language'], function (bookmarkpageView, keyDownEvent, language) {
    'use strict';
    //-- 装载 bookmarkpage模块
    if (window.sraf) {
        window.sraf.addEventListener("getAllBookmarks", getAllBookmarksByLinux);
    }
    //-- Linux 平台接收数据
    function getAllBookmarksByLinux(e){
        if(e.result != 0) return;
        var data = e.data.slice(0,20);
        fillBookmarks(data);
    }
    function getBookmark(){
        if(window.sraf){
            window.sraf.storage.getAllBookmarks();
        }
        if(window.jsUtil){
            var  data = jsUtil.getBookmarkAll();
            data = JSON.parse(data);
            if(data){
                data.slice(0,20);
                fillBookmarks(data);
            }
        }
    }
    function bookmarkUp(dom){
        if (window.sraf) {
            var url = dom.getAttribute('url');
            window.sraf.storage.moveBookmark(url,1)
        }
        if(window.jsUtil){
            var androidId = dom.getAttribute('androidId');
            console.log(androidId,'----------up');
            window.jsUtil.setBookmarkUp(parseInt(androidId))
        }
    }
    function bookmarkDown(dom){
        if (window.sraf) {
            var url = dom.getAttribute('url');
            window.sraf.storage.moveBookmark(url,-1)
        }
        if(window.jsUtil){
            var androidId = dom.getAttribute('androidId');
            console.log(androidId,'----------down');
            window.jsUtil.setBookmarkDown(parseInt(androidId))
        }
    }
    function bookmarkDelete(dom){
        if (window.sraf) {
            var url = dom.getAttribute('url');
            window.sraf.storage.deleteBookmark(url)
        }
        if(window.jsUtil){
            var androidId = dom.getAttribute('androidId');
            console.log(androidId,'----------delete');
            window.jsUtil.deleteBookmarkById(parseInt(androidId))
        }
    }
    function bookmarkEdit(dom,title){
        if (window.sraf) {
            var url = dom.getAttribute('url');
            window.sraf.storage.updateBookmark(url,title)
        }
        if(window.jsUtil){
            var androidId = dom.getAttribute('androidId');
            console.log(androidId,title,'----------edit');
            window.jsUtil.updateCollection(parseInt(androidId),title)
        }
    }
    function deleteAllBookmark(){
        if (window.sraf) {
            window.sraf.storage.deleteAllBookmarks();
        }
        if(window.jsUtil){
            window.jsUtil.clearBookmark()
        }
    }

    //-- 首页初始化布局
    function initHtml() {
        //console.log('bookmarkpage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = bookmarkpageView;
        var bookmarkpage_dom = temp_node.firstElementChild;
        if(!document.getElementById("bookmarkpage_container")){
            document.getElementById("container").appendChild(bookmarkpage_dom);
        }
    }
    //-- 填充bookmarks 数据
    function fillBookmarks(data) {
        //-- 填充bookmark 栏数据
        var html = '';
        for (var i = 0; i < data.length; i++) {
            //-- 去除https 或者 http
            var url = data[i]['url'].replace(/(http|https):\/\//g, '');
            //-- 截取域名和域名首字母
            var domain = url.split("/")[0];
            var le = domain.split(".")[1];
            var begins = le.substr(0, 1).toUpperCase();
            html += '<div class="b-bookmark-item">'
            html +=     '<div>'
            html +=         '<div class="b-bookmark-li row-start" name="b_focus" androidId='+ data[i]['id'] +' url="' + data[i]["url"] + '" id="b_bookmark_1_' + (i + 1) + '">'
            html +=             '<div>' + begins + '</div><div>' + domain + '</div><div><input type="text" class="pointer-events" value="' + data[i]["title"] + '"></div>'
            html +=         '</div>'
            html +=     '</div>'
            html +=     '<div class="b-bookmark-buttons row-start">'
            html +=         '<div class="b-bookmark-button row-center" name="b_focus" id="b_bookmark_2_' + (i + 1) + '"><img src="image/common/edit.webp"/></div>'
            html +=         '<div class="b-bookmark-button row-center" name="b_focus" id="b_bookmark_3_' + (i + 1) + '"><img src="image/common/up.webp"/></div>'
            html +=         '<div class="b-bookmark-button row-center" name="b_focus" id="b_bookmark_4_' + (i + 1) + '"><img src="image/common/down.webp"/></div>'
            html +=         '<div class="b-bookmark-button row-center" name="b_focus" id="b_bookmark_5_' + (i + 1) + '"><img src="image/common/delete.webp"/></div>'
            html +=     '</div>'
            html += '</div>';
        }
        var bookmark_list = document.getElementById('b_bookmark');
        bookmark_list.innerHTML = html;
        //-- 初始化焦点
        s_hash_map.get('b_bookmark').initFocus();
    }
    //-- 填充数据
    function fillData() {
        //console.log('bookmarkpage - 数据填充--------->');
        //-- 填充title栏数据
        document.getElementById("b_title").innerHTML = language['Bookmarks'];
        document.getElementById("b_bookmark_clear_title").innerHTML = language['Clear All Bookmark']
    }

    var s_hash_map = new Map();
    s_hash_map.set('b_bookmark', new bookmarkFocusEvent())
    s_hash_map.set('b_clear', new clearFocusEvent())

    function bookmarkFocusEvent() {
        this.prefix = 'b_bookmark';
        this.offset = 0;
        this.initFocus = function () {
            var container = document.getElementById(this.prefix);
            // -- 注：hasChildNodes 对于空字符串会认为是子节点，故view里面 container dom 不能有空格
            if (!container.hasChildNodes()) {
                document.getElementById("b_clear_1_1").classList.add('active');
            } else {
                var new_point = container.querySelector(".b-bookmark-li").getAttribute("id")
                var point_y = new_point.split('_')[3];
                s_hash_map.get(this.prefix).addFocus(1, point_y);
            }
        }
        this.focusUp = function (point_x, point_y) {
            try {
                this.removeFocus();
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if (!dom.parentNode.parentNode.previousElementSibling) {
                    s_hash_map.get('b_clear').addFocus(1, 1);
                } else {
                    var new_point = dom.parentNode.parentNode.previousElementSibling.firstElementChild.firstElementChild.getAttribute('id');
                    var new_point_y = new_point.split('_')[3];
                    this.bookmarkOffset(point_x, new_point_y);
                    s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
                }
                this.inputBlur();
            } catch (e) {
                // console.log(e);
            }
        }

        this.focusDown = function (point_x, point_y) {
            //-- 判断当前焦点下方的item
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if (!dom.parentNode.parentNode.nextElementSibling) return;
            var new_point = dom.parentNode.parentNode.nextElementSibling.firstElementChild.firstElementChild.getAttribute('id');
            var new_point_y = new_point.split('_')[3];

            this.bookmarkOffset(point_x, new_point_y);
            this.removeFocus();
            s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
            this.inputBlur();
        }
        this.focusLeft = function (point_x, point_y) {
            var new_point_x = point_x - 1;
            if (!this.checkFocus(new_point_x, point_y)) return;
            this.removeFocus();
            this.addFocus(new_point_x, point_y);
            this.inputBlur();
        }

        this.focusRight = function (point_x, point_y) {
            var new_point_x = point_x + 1;
            if (!this.checkFocus(new_point_x, point_y)) return;
            this.removeFocus();
            this.addFocus(new_point_x, point_y);
            this.inputBlur();
        }
        this.back = function(point_x,point_y){
            window.history.go(-1);
        }
        this.focusClick = function (point_x, point_y) {
            try {
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                var b_bookmark_item = dom.parentNode.parentNode;
                if (point_x == 1) {
                    //-- 跳转
                    console.log('跳转');
                    var url = dom.getAttribute("url");
                    if(url) window.location.href = url;
                }
                if (point_x == 2) {
                    //-- 编辑标题
                    var input = document.getElementById("bookmarkpage_container").querySelector("input:focus");
                    if(input){
                        this.inputBlur(input);
                    }else{
                        this.inputFocus(point_x, point_y);
                    }
                }
                if (point_x == 3) {
                    //-- 向上移动位置
                    if (!b_bookmark_item.previousElementSibling) return;
                    //-- 获取当前item，显示部分子元素
                    var now_item = b_bookmark_item.firstElementChild.firstElementChild.cloneNode(true);
                    var next_item = b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.cloneNode(true);
                    b_bookmark_item.firstElementChild.firstElementChild.setAttribute("url",next_item.getAttribute("url"));
                    b_bookmark_item.firstElementChild.firstElementChild.innerHTML = null;
                    b_bookmark_item.firstElementChild.firstElementChild.appendChild(next_item.children[0].cloneNode(true))
                    b_bookmark_item.firstElementChild.firstElementChild.appendChild(next_item.children[1].cloneNode(true))
                    b_bookmark_item.firstElementChild.firstElementChild.appendChild(next_item.children[2].cloneNode(true));

                    b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.setAttribute("url",now_item.getAttribute("url"));
                    b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.innerHTML = null;
                    b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.appendChild(now_item.children[0].cloneNode(true))
                    b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.appendChild(now_item.children[1].cloneNode(true))
                    b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.appendChild(now_item.children[2].cloneNode(true))

                    this.focusUp(point_x, point_y);
                    this.inputBlur();
                    //-- 对接底层接口
                    bookmarkUp(now_item);
                }
                if (point_x == 4) {
                    //-- 向下移动位置
                    if (!b_bookmark_item.nextElementSibling) return;
                    //-- 获取当前item，显示部分子元素
                    var now_item = b_bookmark_item.firstElementChild.firstElementChild.cloneNode(true);
                    var next_item = b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.cloneNode(true);
                    b_bookmark_item.firstElementChild.firstElementChild.setAttribute("url",next_item.getAttribute("url"));
                    b_bookmark_item.firstElementChild.firstElementChild.innerHTML = null;
                    b_bookmark_item.firstElementChild.firstElementChild.appendChild(next_item.children[0].cloneNode(true))
                    b_bookmark_item.firstElementChild.firstElementChild.appendChild(next_item.children[1].cloneNode(true))
                    b_bookmark_item.firstElementChild.firstElementChild.appendChild(next_item.children[2].cloneNode(true));

                    b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.setAttribute("url",now_item.getAttribute("url"));
                    b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.innerHTML = null;
                    b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.appendChild(now_item.children[0].cloneNode(true))
                    b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.appendChild(now_item.children[1].cloneNode(true))
                    b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.appendChild(now_item.children[2].cloneNode(true))
                    this.focusDown(point_x, point_y)
                    this.inputBlur();
                    //-- 对接底层接口
                    bookmarkDown(now_item);
                }
                if (point_x == 5) {
                    if (b_bookmark_item.nextElementSibling) {
                        //-- 向下删除
                        //-- 判断当前焦点下方的item
                        var new_point = b_bookmark_item.nextElementSibling.firstElementChild.firstElementChild.getAttribute('id');
                        var new_point_y = new_point.split('_')[3];
                        this.removeFocus();
                        s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
                    } else if (b_bookmark_item.previousElementSibling) {
                        //-- 向上删除
                        var new_point = b_bookmark_item.previousElementSibling.firstElementChild.firstElementChild.getAttribute('id');
                        var new_point_y = new_point.split('_')[3];
                        //-- 删除时需要同时改变偏移量
                        if (this.offset > 0) {
                            this.offsetType('up');
                        }
                        this.removeFocus();
                        s_hash_map.get(this.prefix).addFocus(point_x, new_point_y);
                    } else {
                        //-- 删完了
                        s_hash_map.get('b_clear').addFocus(1, 1);
                    }
                    //-- 对接终端数据
                    var dom = document.getElementById(this.prefix + '_1_' + point_y);
                    bookmarkDelete(dom);
                    b_bookmark_item.parentNode.removeChild(b_bookmark_item);
                }
            } catch (e) {
                console.log(e);
            }
        }
        this.bookmarkOffset = function (point_x, point_y) {
            var child = document.getElementById(this.prefix + '_' + point_x + '_' + point_y).parentNode.parentNode;
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
            var bookmark_offset = '-' + this.offset * 6.9 + 'vh';
            var bookmark_item = document.getElementById('b_bookmark');
            bookmark_item.style.webkitTransform = "translateY(" + bookmark_offset + ")";
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
                dom.parentNode.parentNode.classList.add('transform-focus');
            }
        }
        this.removeFocus = function () {
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if (dom) {
                dom.classList.remove('active');
                //-- 同时移除父元素类名
                dom.parentNode.parentNode.classList.remove('transform-focus');
            }
        }
        this.inputBlur = function(){
            var input = document.getElementById("bookmarkpage_container").querySelector("input:focus");
            if(input) input.blur();
        }
        this.inputFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y).parentNode.parentNode;
            var input = dom.querySelector("input");
            if(input){
                var value = input.value;
                input.value = '';
                input.focus();
                input.value = value;
            }
        }
    }

    function clearFocusEvent() {
        this.prefix = 'b_clear';

        this.focusUp = function (point_x, point_y) {
            return;
        }
        this.focusDown = function (point_x, point_y) {
            //-- 判断当前焦点下方有没有item ， 如果没有焦点不动
            if (!document.getElementById('b_bookmark').hasChildNodes()) return;
            try {
                this.removeFocus();
                s_hash_map.get('b_bookmark').initFocus();
            } catch (e) {
                console.log(e);
            }
        }
        this.focusLeft = function (point_x, point_y) {
            return;
        }
        this.focusRight = function (point_x, point_y) {
            return;
        }
        this.back = function(point_x,point_y){
            window.history.go(-1);
        }
        this.focusClick = function (point_x, point_y) {
            try {
                this.addFocus(1, 1);
                new Msg({
                    content:"Clear All Bookmarks ?",
                    confirm:function(){
                        //-- 对接接口
                        try{
                            deleteAllBookmark();
                            document.getElementById("b_bookmark").innerHTML = null;
                        }catch(e){
                            console.log(e);
                            return;
                        }
                    }
                })
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

    function onclickEvent() {
        //console.log('bookmarkpage - 开启鼠标点击监听-------->');
        //-- 判断当前显示页面
        var bookmarkpage_dom = document.getElementById('bookmarkpage_container');
        var focus_doms = bookmarkpage_dom.querySelectorAll('[name="b_focus"]');
        for (var i = 0; i < focus_doms.length; i++) {
            focus_doms[i].onclick = function (e) {
                var focus_id = e.target.id.split('_');
                if (focus_id[0] !== 'b') return false;
                var position = focus_id[0] + '_' + focus_id[1];
                var point_x = parseInt(focus_id[2], 10);
                var point_y = parseInt(focus_id[3], 10);
                s_hash_map.get(position).focusClick(point_x, point_y);
            }
        }
    }

    function onblurEvent() {
        //-- 判断当前显示页面
        var bookmarkpage_dom = document.getElementById('bookmarkpage_container');
        var input_doms = bookmarkpage_dom.querySelectorAll('input');
        for (var i = 0; i < input_doms.length; i++) {
            input_doms[i].onblur = function (e) {
                var input = e.target;
                var dom = input.parentNode.parentNode;
                bookmarkEdit(dom,input.value);
            }
        }
    }
    //-- 添加historypage页面全局监听
    function onkeydownEvent (){
        var keyDown = keyDownEvent.createNew();
        keyDown.bindKey('b_bookmark', new bookmarkFocusEvent())
        keyDown.bindKey('b_clear', new clearFocusEvent())
    
    }
    var render = function () {
        try {
            initHtml();
            fillData();
            if (window.sraf || window.jsUtil) {
                getBookmark();
            }else{
                //-- 测试
                var data = [{url:'www.baidu.com1',title:'baidu'},{url:'www.baidu.com2',title:'baidu'},
                    {url:'www.baidu3.com1',title:'baidu'},{url:'www.baidu.com4',title:'baidu'},{url:'www.baidu.com5',title:'baidu'},
                    {url:'www.baidu.com6',title:'baidu'},{url:'www.baidu.com7',title:'baidu'},{url:'www.baidu.com8',title:'baidu'},
                    {url:'www.baidu.com9',title:'baidu'}];
                fillBookmarks(data);
            }
        } catch (e) {
            console.log(e);
        }
    }
    var  run = function(){
        //onclickEvent();
        //onblurEvent();
    }
    return {
        render:render,
        bind:onkeydownEvent,
        run:run
    };
});