define(['text!view/homepageView.html','unity/keyDownEvent','unity/network','i18n!nls/language'],function(homepageView,keyDownEvent,network,language) {
    'use strict';
    if(window.sraf){
        console.log('注册监听----homepage');
        window.sraf.addEventListener("getAllBookmarks",getAllBookmarksByLinux);
    }
    //-- Linux 平台接收数据
    function getAllBookmarksByLinux(e){
        if(e.result != 0) return;
        var data = e.data.slice(0,20);
        setAllBookmarks(data);
    }
    function getBookmarks(){
        if(window.sraf){
            console.log('触发监听----homepage');
            window.sraf.storage.getAllBookmarks();
        }
        if(window.jsUtil){
            var  data = jsUtil.getBookmarkAll();
            data = JSON.parse(data);
            if(data){
                data.slice(0,20);
                setAllBookmarks(data);
            }
        }
    }
    function initHtml(){
        var temp_node = document.createElement('div');
        temp_node.innerHTML = homepageView;
        var homepage_dom = temp_node.firstElementChild;
        if(!document.getElementById("homepage_container")){
            document.getElementById("container").appendChild(homepage_dom);
        }
    }
    //-- 首页填充数据
    function fillData() {
        //console.log('homepage - 数据填充--------->');
        //-- 填充tab栏数据
        document.getElementById("h_tab_1_1").innerHTML = language['Recommended'];
        document.getElementById("h_tab_2_1").innerHTML = language['Bookmarks'];
        document.getElementById("h_search_title").innerHTML = language['Search or enter address'];
        getRecommendedData().then(function(data){
            var recommend_data = data;
            //-- 填充recommended数据
            var recommended_doms = document.getElementById("h_recommended").querySelectorAll('[name="h_focus"]');
            for(var i=0;i<recommended_doms.length; i++){
                var item = recommended_doms[i];
                if(recommend_data.list[i]){
                    var body_width = document.body.scrollWidth;
                    if(body_width > 1920){
                        item.innerHTML = '<img class="pointer-events" src="./image/'+recommend_data.index+'/big/'+recommend_data.list[i].img+'" />';
                    }else if(body_width > 1280 && body_width <= 1920){
                        item.innerHTML = '<img class="pointer-events" src="./image/'+recommend_data.index+'/medium/'+recommend_data.list[i].img+'" />';
                    }else{
                        item.innerHTML = '<img class="pointer-events" src="./image/'+recommend_data.index+'/small/'+recommend_data.list[i].img+'" />';
                    }
                    item.setAttribute("url",recommend_data.list[i].url)
                }else{
                    item.parentNode.removeChild(item)
                }
            }
        })
    }
    //-- 添加homepage页面全局监听
    function onkeydownEvent (){
        var keyDown = keyDownEvent.createNew();
        keyDown.bindKey('h_tab', new tabFocusEvent())
        keyDown.bindKey('h_recommended', new recommendedFocusEvent())
        keyDown.bindKey('h_bookmarks',new bookmarksFocusEvent())
    }

    function onclickEvent(){
        //console.log('homepage - 开启鼠标点击监听-------->');
        var homepage_dom = document.getElementById('homepage_container');
        var focus_doms = homepage_dom.querySelectorAll('[name="h_focus"]');
        for(var i=0;i<focus_doms.length;i++){
            focus_doms[i].onclick = function(e){
                var focus_id = e.target.id.split('_');
                if(focus_id[0] !== 'h') return false;
                var position = focus_id[0]+'_'+focus_id[1];
                var point_x = parseInt(focus_id[2],10);
                var point_y = parseInt(focus_id[3],10);
                h_hash_map.get(position).focusClick(point_x,point_y);
            }
        }
    }

    var h_hash_map = new Map();
    h_hash_map.set('h_tab',new tabFocusEvent())
    h_hash_map.set('h_recommended',new recommendedFocusEvent())
    h_hash_map.set('h_bookmarks',new bookmarksFocusEvent())

    //-- 顶部
    function tabFocusEvent(){
        this.prefix = 'h_tab';
        this.max_x = 5;

        this.focusUp = function (){
            //console.log('up no');
        }

        this.focusDown = function(point_x,point_y){
            //-- 判断当前显示的是哪个tab
            var check_tab = document.getElementById('homepage_container').querySelector('.display-block');
            var id = check_tab.getAttribute('id');
            //-- recommended 页面
            if(id === 'h_recommended'){
                try{
                    point_x = 1;
                    h_hash_map.get('h_recommended').initFocus();
                }catch(e){
                    return;
                }
            }
            //-- bookmarks 页面
            if(id === 'h_bookmarks'){
                try{
                    point_x = 2;
                    h_hash_map.get('h_bookmarks').initFocus();
                }catch(e){
                    return ;
                }
            }
            this.removeFocus();
            this.addCurrent(point_x,point_y);
        }
        
        this.focusLeft = function(point_x,point_y){
            var new_point_x = point_x-1 < 1 ? this.max_x : point_x-1;
            if(new_point_x === 1){
                // --显示recommended页面
                h_hash_map.get("h_bookmarks").hiddenView();
                h_hash_map.get("h_recommended").showView();
            }
            if(new_point_x === 2){
                // --显示bookmarks页面
                h_hash_map.get("h_recommended").hiddenView();
                h_hash_map.get("h_bookmarks").showView();
            }
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
        }

        this.focusRight = function(point_x,point_y){
            var new_point_x = point_x + 1 > this.max_x ? 1 : point_x + 1;
            if(new_point_x === 1){
                // --显示recommended页面
                h_hash_map.get("h_bookmarks").hiddenView();
                h_hash_map.get("h_recommended").showView();
            }
            if(new_point_x === 2){
                // --显示bookmarks页面
                h_hash_map.get("h_bookmarks").showView();
                h_hash_map.get("h_recommended").hiddenView();
            }
            //-- 移除所有焦点 和 半焦点
            this.removeFocus();
            this.removeCurrent();
            this.addFocus(new_point_x,point_y);
        }
        this.back = function(){
            // function onOpen(){
            //     window.notification = true;
            // }
            // function onClose(){
            //     window.notification = false;
            // }
            // if(window.notification){
            //     jsUtil.exitApp()
            // }else{
            //     window.spop({  
            //         template  : "2秒内再次点击back键退出应用！",
            //         style     : 'info',
            //         autoclose : 2000,
            //         position  : 'bottom-center',
            //         icon      : true,
            //         onOpen    : onOpen,
            //         onClose   : onClose
            //     });
            // }
        }
        this.focusClick = function(point_x,point_y){
            //-- 通过移动事件来实现点击事件焦点效果
            this.focusRight(point_x-1,point_y);
            if(point_x === 3){
                var query = window.location.search.substring(1);
                window.location.href = 'search.php?'+query
            }
            if(point_x === 4){
                //console.log('跳转引导页------------>');
            }
            if(point_x === 5){
                //console.log('跳转setting页------------>');
                var query = window.location.search.substring(1);
                window.location.href = 'setting.php?'+query
            }
        }
        this.addFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            dom.classList.add('active');
        }
        this.removeFocus = function(){
            var dom = document.getElementById(this.prefix).querySelector(".active")
            if(dom) dom.classList.remove('active');
        }
        
        this.addCurrent = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y).parentNode.querySelector('.current-line');
            if(dom) dom.classList.add('current');
        }
        this.removeCurrent = function(){
            var dom = document.getElementById(this.prefix).querySelector(".current")
            if(dom) dom.classList.remove('current');
        }
    }

    function recommendedFocusEvent(){
        this.prefix = 'h_recommended';
        this.max_x = 6;
        this.max_y = 2;

        //-- 12宫格偏移量
        this.offset = 0;
        this.initFocus = function (){
            this.removeFocus();
            var dom = document.getElementById(this.prefix + '_' + (1 + this.offset) + '_1');
            if(dom) dom.classList.add('active');
        }
        this.focusUp = function (point_x,point_y){
            //-- 当前在第一行
            if(point_y === 1){    
                this.removeFocus();
                h_hash_map.get('h_tab').addFocus(1,1);
                h_hash_map.get('h_tab').removeCurrent(1,1); 
            }
            //-- 当前在第二行
            if(point_y === 2){
                var new_point_y = point_y - 1;
                this.removeFocus();
                h_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
            }
            this.recommendedOffset(point_x)
        }

        this.focusDown = function(point_x,point_y){
            var new_point_y = point_y + 1;
            //-- 判断当前焦点下方有没有item ， 如果没有向前取
            var check_point_x = this.getDownFocusPoint(point_x,new_point_y); 
            if(!check_point_x) return ;
            this.removeFocus();
            this.addFocus(check_point_x,new_point_y);
            this.recommendedOffset(check_point_x)
        }
        this.focusLeft = function(point_x,point_y){
            var new_point_x = point_x - 1;
            if(!this.checkFocus(new_point_x,point_y)) return ;
            this.recommendedOffset(new_point_x)
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
        }

        this.focusRight = function(point_x,point_y){
            var new_point_x = point_x + 1;
            if(!this.checkFocus(new_point_x,point_y)) return ;        
            this.recommendedOffset(new_point_x)           
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
        } 
        this.back = function(){
            
        }
        this.focusClick = function(point_x,point_y){
            try{
                //-- 判断当前点击的位置
                var check_click_offset = point_x-this.offset;
                if(check_click_offset === 5 || check_click_offset === 0){
                    this.recommendedOffset(point_x)
                    return;
                }
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                var url = dom.getAttribute("url");
                if(url) window.location.href = url;
            }catch(e){
                //console.log(e);
            }
        }
        this.recommendedOffset = function(point_x){
            //-- 判断12宫格偏移量
            var count = point_x - this.offset ;
            if(count < 1){
                this.offset -= 1
            }
            if(count > 4){
                this.offset += 1;
            }
            var recommended_offset = '-' + this.offset*16.5 + '%';
            if(!recommended_offset) return;
            var recommended_dom = document.getElementsByClassName("h-recommended-list")[0];
            recommended_dom.style.webkitTransform = "translateX("+recommended_offset+")"
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
        this.showView = function(){
            document.getElementById("h_recommended").classList.add('display-block');
        }
        this.hiddenView = function(){
            document.getElementById("h_recommended").classList.remove('display-block');
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

    //-- bookmarks
    function bookmarksFocusEvent(){
        this.prefix = 'h_bookmarks';
        //-- 每页5个
        this.max_x = 5;
        //-- 当前页
        this.point_page = 1;
        //-- 偏移数
        this.offset = 0;
        this.initElements = function(){
            //-- 判断bookmarks页面是否渲染完成
            var bookmarks = document.getElementById(this.prefix);
            if(!bookmarks.hasChildNodes()){
                try{
                    if(window.jsUtil || window.sraf){
                        getBookmarks();
                    }else{
                        var data = [
                            { 'time': '1584614785968', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                            { 'time': '1584604785968.808105', 'url': 'http://www.booking.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                            { 'time': '1584514785968.808105', 'url': 'http://www.goole.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                            { 'time': '1584414785968.808105', 'url': 'http://www.bbc.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                            { 'time': '1584314785968.808105', 'url': 'http://www.lanhuapp1111.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                            { 'time': '1584214785968.808105', 'url': 'http://www.fanyi.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' }
                        ];
                        setAllBookmarks(data);
                    }
                    
                }catch(e){
                    console.log(e);
                    return;
                }
            }
        }
        //-- 开启点击监听
        this.onclickEvent = function(){
            //console.log('homepage - 异步开启bookmarks页面鼠标点击监听-------->');
            var focus_doms = document.querySelectorAll('[name="h_bookmarks_focus"]');
            for(var i=0;i<focus_doms.length;i++){
                focus_doms[i].onclick = function(e){
                    var focus_id = e.target.id.split('_');
                    if(focus_id[0] !== 'h') return false;
                    var position = focus_id[0]+'_'+focus_id[1];
                    var point_x = parseInt(focus_id[2],10);
                    var point_y = parseInt(focus_id[3],10);
                    h_hash_map.get(position).focusClick(point_x,point_y);
                }
            }
        }
        this.initFocus = function (){
            this.removeFocus();
            document.querySelector("#"+this.prefix + "_"+(1+this.offset)+"_1").classList.add('active');
            //-- 判断是否需要换页
            this.point_page = Math.ceil((1+this.offset)/5);
            this.addPageFocus();
        }
        this.focusUp = function (point_x,point_y){
            this.removeFocus();
            h_hash_map.get('h_tab').addFocus(2,1);
            h_hash_map.get('h_tab').removeCurrent(2,1); 
        }

        this.focusDown = function(point_x,point_y){
            //console.log("down no");
        }
        this.focusLeft = function(point_x,point_y){
            var new_point_x = point_x - 1;
            if(new_point_x < 1) return;
            //-- 判断是否需要换页
            this.point_page = Math.ceil((new_point_x)/5);
            this.addPageFocus();
            this.bookmarksOffset(new_point_x);
            this.removeFocus();
            this.addFocus(new_point_x,point_y);
        }

        this.focusRight = function(point_x,point_y){
            var new_point_x = point_x + 1;
            var right_element = document.querySelector("#"+this.prefix + "_" + new_point_x + '_'+ point_y);
            if(!right_element) return ;
            //-- 判断是否需要换页
            this.point_page = Math.ceil((new_point_x)/5);
            this.addPageFocus();
            this.bookmarksOffset(new_point_x);
            this.removeFocus();
            this.addFocus(new_point_x,point_y); 
        }
        this.back = function(){
            
        }
        this.focusClick = function(point_x,point_y){
            try{
                //-- 判断当前点击的位置
                var check_click_offset = point_x-this.offset;
                if(check_click_offset === 6 || check_click_offset === 0){
                    this.point_page = Math.ceil((point_x)/5);
                    this.addPageFocus();
                    this.bookmarksOffset(point_x)
                    return;
                }
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                var url = dom.getAttribute("url");
                if(url) window.location.href = url;
            }catch(e){
                //console.log(e);
            }
        }
        this.bookmarksOffset = function(point_x){
             //-- 判断偏移量
             var count = point_x - this.offset ;
             if(count < 1){
                 this.offset -= 1
             }
            if(count > 5){
                this.offset += 1;
            }
            var bookmarks_offset = '-' + this.offset*18 + '%';
            if(!bookmarks_offset) return;
            var bookmarks_dom = document.getElementById(this.prefix + '_content');
            bookmarks_dom.style.webkitTransform = "translateX("+bookmarks_offset+")";
        }
        this.showView = function(){
            //-- 判断是否需要渲染bookmarks页面
            this.initElements();
            document.getElementById("h_bookmarks").classList.add('display-block');
        }
        this.hiddenView = function(){
            document.getElementById("h_bookmarks").classList.remove('display-block');
        }
        this.addFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_list_' + this.point_page).querySelector("#"+this.prefix + "_" + point_x + '_'+ point_y);
            if(dom) dom.classList.add('active');
        }
        this.removeFocus = function(){
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if(dom) dom.classList.remove('active');
        }
        this.addPageFocus = function(){
            var dom = document.getElementById(this.prefix + '_page'  + '_' + this.point_page);
            if(dom){
                document.getElementById("h_bookmarks_page").querySelector(".page-active").classList.remove('page-active');
                dom.classList.add('page-active');
            }
        }
    }
    
    //-- 初始化主页焦点
    function focusInit(){
        //console.log('homepage - 初始化焦点----------->');
        document.getElementById("h_tab_1_1").classList.add('active');
    }

    //-- 获取12宫格数据
    function getRecommendedData(){
        //console.log('api: 获取九宫格数据 ----------->');
        var params = {duid:'111',token:'111'}
        var option = {
            url:'index.php',
            type:'GET',
            dataType:'json',
            data:params
        }
        return network.send(option).then(function(request){
            var req = JSON.parse(request); 
            return {index:'01',list:req}
        }).catch(function(){
            var req =  [
                {'url':'https://www.yandex.ru/?clid=2334174','img':'1.webp'},
                {'url':'https://www.facebook.com','img':'2.png'},
                {'url':'https://www.instagram.com','img':'3.png'},
                {'url':'http://www.amazon.com','img':'4.png'},
                {'url':'http://www.booking.com','img':'5.png'},
                {'url':'http://www.bing.com','img':'6.png'},
                {'url':'http://www.agoda.com','img':'7.png'},
                {'url':'https://www.google.com','img':'8.png'},
                {'url':'https://twitter.com','img':'9.png'},
                {'url':'https://www.youtube.com','img':'10.png'},
                {'url':'http://www.bbc.com','img':'11.jpg'},
                {'url':'https://www.flickr.com','img':'12.png'},
            ]
            return {index:'01',list:req}
        });
    }
    //-- 获取bookmarks数据
    function setAllBookmarks(data){
        //console.log('渲染bookmarks页面-------------->');
        var bookmarks_count;
        var bookmarks_page_count;
        var color_arr = ["#3473E2","#FD9827","#59ADEA","#D21626","#3D5B96"]
        bookmarks_count = data.length;
        if(bookmarks_count < 1) return;
        bookmarks_page_count = Math.ceil((bookmarks_count)/5);
        // -- 添加bookmarks列表滑动容器
        var bookmarks_dom = document.createElement('div');
        bookmarks_dom.classList.add('h-bookmarks-content');
        bookmarks_dom.setAttribute("id","h_bookmarks_content");
        document.getElementById("h_bookmarks").appendChild(bookmarks_dom);
        //-- 添加bookmarks 分页容器
        var bookmarks_page_dom = document.createElement('div');
        bookmarks_page_dom.classList.add('h-bookmarks-page');
        bookmarks_page_dom.setAttribute("id","h_bookmarks_page");
        document.getElementById("h_bookmarks").appendChild(bookmarks_page_dom);

        var bookmarks_data;
        for(var i =1; i <= bookmarks_page_count; i ++)
        {
            //-- 创建bookmarks单页容器
            var bookmarks_list_dom = document.createElement("div");
            bookmarks_list_dom.setAttribute("id","h_bookmarks_list_" + i);
            bookmarks_list_dom.classList.add("h-bookmarks-list");
            bookmarks_dom.appendChild(bookmarks_list_dom);

            for(var j=1;j<=5;j++){
                var index = (i-1) * 5 + j;
                if(index <= bookmarks_count){
                    bookmarks_data = data[index-1];
                    //-- 去除https 或者 http
                    var title = bookmarks_data['title']
                    var url = bookmarks_data['url'].replace(/(http|https):\/\//g,'');
                    //-- 截取域名和域名首字母
                    var domain = url.split("/")[0];
                    var le = domain.split(".")[1];
                    var begins = le.substr(0,1).toUpperCase();
                    var element = document.createElement('div');
                    element.setAttribute("name","h_bookmarks_focus")
                    //-- id h_bookmarks_2_1 表示在第一行 第二个
                    element.setAttribute("id","h_bookmarks_"+ ((i-1)*5+j) +'_1');
                    element.style.background = color_arr[j-1];
                    element.setAttribute("url",bookmarks_data['url']);
                    element.innerHTML = '<div class="h-bookmarks-begins pointer-events" style="color:'+color_arr[j-1]+'">'+begins+'</div><div class="h-bookmarks-domain pointer-events">'+le+'</div><div class="h-bookmarks-url pointer-events row-center"><p>'+title+'</p></div>'
                    bookmarks_list_dom.appendChild(element);
                }
            }

            //-- 创建 bookmarks 底部分页
            var bookmarks_page_element = document.createElement("div");
            bookmarks_page_element.setAttribute("id","h_bookmarks_page_" + i);
            if(i === 1){
                bookmarks_page_element.classList.add("page-active");
            }
            bookmarks_page_dom.appendChild(bookmarks_page_element);
        }
        //-- 异步开启bookmarks页面点击监听
        h_hash_map.get('h_bookmarks').onclickEvent();
    }
    var render = function(){
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
        run:run
    };
});

