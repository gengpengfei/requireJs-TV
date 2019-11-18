define(function(){
    'use strict';
    //-- 添加homepage页面全局监听
    var homepageEvent = {}
    homepageEvent.onkeydownEvent = function(){
        console.log('homepage - 开启遥控按下监听-------->');
        document.addEventListener('keydown',function(e){
            //-- 判断当前显示页面
            var homepage_dom = document.getElementById('homepage_container');
            if(!homepage_dom.classList.contains('module-block')) return;
            //-- 获取当前页焦点位置
            var element = homepage_dom.querySelector(".active");
            var focus_id = element.getAttribute("id").split('_');
            if(focus_id[0] !== 'h') return false;
            var key_code = e.keyCode;
            var position = focus_id[0]+'_'+focus_id[1];
            var point_x = parseInt(focus_id[2],10);
            var point_y = parseInt(focus_id[3],10);
            //-- up
            if(key_code == 38){
                h_hash_map.get(position).focusUp(point_x,point_y);
            }
            //-- down
            if(key_code == 40){
                h_hash_map.get(position).focusDown(point_x,point_y);
            }
            //-- left 
            if(key_code == 37){
                h_hash_map.get(position).focusLeft(point_x,point_y);
            }
            //-- right
            if(key_code == 39){
                h_hash_map.get(position).focusRight(point_x,point_y);
            }
            //-- enter
            if(key_code == 13){
                h_hash_map.get(position).focusClick(point_x,point_y);
            }
        });
    }

    homepageEvent.onclickEvent = function(){
        console.log('homepage - 开启鼠标点击监听-------->');
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
            console.log('up no');
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
                    console.log(e);
                }
            }
            //-- bookmarks 页面
            if(id === 'h_bookmarks'){
                try{
                    point_x = 2;
                    h_hash_map.get('h_bookmarks').initFocus();
                }catch(e){
                    console.log(e);
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

        this.focusClick = function(point_x,point_y){
            //-- 通过移动事件来实现点击事件焦点效果
            this.focusRight(point_x-1,point_y);
            if(point_x === 3){
                console.log('跳转搜索页------------>');
                require(["page/searchPage","js/moduleController"],function(searchpage,moduleController) {
                    try{
                        //-- 判断搜索页是否渲染
                        var searchpage_dom = document.getElementById("searchpage_container");
                        if(!searchpage_dom) searchpage.loadModule();
                        moduleController.showSearchPage();
                    }catch(e){
                        console.log(e);
                    }
                });
            }
            if(point_x === 4){
                console.log('跳转引导页------------>');
            }
            if(point_x === 5){
                console.log('跳转setting页------------>');
                require(["page/settingPage","js/moduleController"],function(settingpage,moduleController){
                    try{
                        //-- 判断设置页是否渲染
                        var settingpage_dom = document.getElementById("settingpage_container");
                        if(!settingpage_dom) settingpage.loadModule();
                        moduleController.showSettingPage();
                    }catch(e){
                        console.log(e);
                    }
                })
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
                window.location.href = url;
            }catch(e){
                console.log(e);
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

    //-- bookmarks 后期可考虑优化，能否html event css 完全异步
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
            var is_bookmarks = document.getElementsByClassName("h-bookmarks-content")[0]
            if(!is_bookmarks){
                console.log('渲染bookmarks页面-------------->');
                var bookmarks_count;
                var bookmarks_page_count;
                var color_arr = ["#3473E2","#FD9827","#59ADEA","#D21626","#3D5B96"]
                //-- 读取ob插件
                var ob_plugin = document.getElementById('sraf_config_sraf');
                if (ob_plugin){
                    try{
                        // bookmarks_count = ob_plugin.getBookmarkCount();
                        // bookmarks_page_count = Math.ceil((bookmarks_count+1)/5);
                    }
                    catch(err){
                        return  ;
                    }
                }
                bookmarks_count = 18;
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
                    try{
                        //-- 创建bookmarks单页容器
                        var bookmarks_list_dom = document.createElement("div");
                        bookmarks_list_dom.setAttribute("id","h_bookmarks_list_" + i);
                        bookmarks_list_dom.classList.add("h-bookmarks-list");
                        bookmarks_dom.appendChild(bookmarks_list_dom);

                        for(var j=1;j<=5;j++){
                            var index = (i-1) * 5 + j;
                            if(index <= bookmarks_count){
                                // bookmarks_data = ob_plugin.getBookmarkByIndex(index);
                                bookmarks_data =[0,1,'https://www.baidu.com/?search=dfadfdf&&glag=adf&&fledg=22222&&fdfaf=aa','']
                                //-- 去除https 或者 http
                                var url = bookmarks_data[2].replace(/(http|https):\/\//g,'');
                                //-- 截取域名和域名首字母
                                var domain = url.split("/")[0];
                                var le = domain.split(".")[1];
                                var begins = le.substr(0,1);
                                var element = document.createElement('div');
                                element.setAttribute("name","h_bookmarks_focus")
                                //-- id h_bookmarks_2_1 表示在第一行 第二个
                                element.setAttribute("id","h_bookmarks_"+ ((i-1)*5+j) +'_1');
                                element.style.background = color_arr[j-1];
                                element.setAttribute("url",bookmarks_data[2]);

                                element.innerHTML = '<div class="h-bookmarks-begins pointer-events" style="color:'+color_arr[j-1]+'">'+begins+'</div><div class="h-bookmarks-domain pointer-events">'+le+'</div><div class="h-bookmarks-url pointer-events row-center"><p>'+url+'</p></div>'
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
                    }catch(err){
                        console.log(err);
                        return;
                    }
                }
                //-- 异步开启bookmarks页面点击监听
                this.onclickEvent();
            }
        }
        //-- 开启点击监听
        this.onclickEvent = function(){
            console.log('homepage - 异步开启bookmarks页面鼠标点击监听-------->');
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
            console.log("down no");
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

        this.focusClick = function(point_x,point_y){
            try{
                //-- 判断当前点击的位置
                var check_click_offset = point_x-this.offset;
                if(check_click_offset === 6 || check_click_offset === 0){
                    this.bookmarksOffset(point_x)
                    return;
                }
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                var url = dom.getAttribute("url");
                window.location.href = url;
            }catch(e){
                console.log(e);
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
    return homepageEvent;
})
