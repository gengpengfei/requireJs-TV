define(['jquery', 'navigation', 'unity/historyRouter', 'text!view/homepageView.html', 'unity/network', 'i18n!nls/language', 'unity/commonFun', 'css!style/homepage.css', 'animation'], function($, SN, Router, homepageView, network, language, Fun) {
    'use strict';
    var state = {
            isRender: false
        }
        //-- Linux 平台接收数据
    function getAllBookmarksByLinux(e) {
        if (e.result != 0) return;
        var data = e.data.slice(0, 20);
        hash_map.get("h_bookmarks").initElements(data);
    }

    function getBookmarks() {
        if (window.sraf) {
            window.sraf.addEventListener("getAllBookmarks", getAllBookmarksByLinux);
            window.sraf.storage.getAllBookmarks();
        }
        if (window.jsUtil) {
            var data = jsUtil.getBookmarkAll();
            data = JSON.parse(data);
            if (data) {
                data.slice(0, 20);
                hash_map.get("h_bookmarks").initElements(data);
            }
        }
    }

    var hash_map = new Map();
    hash_map.set('h_tab', new tabFocusEvent())
    hash_map.set('h_recommended', new recommendedFocusEvent())
    hash_map.set('h_bookmarks', new bookmarksFocusEvent())
    hash_map.set('h_games', new gamesFocusEvent())

    function tabFocusEvent() {
        this.back = function() {

        }
        this.focusClick = function(elem) {
            if (elem.id === "help") {
                Router.push('/help', { "from": "homepage" });
            }
            if (elem.id === "search") {
                //-- web端埋点发送
                if (window.jsUtil) {
                    var data = {
                        "event_name": "SearchTerms",
                        "data": "跳转搜索"
                    }
                    window.jsUtil.sendWebEvent("SearchTerms", JSON.stringify(data));
                }
                Router.push('/search', { "from": "homepage" });
            }
            if (elem.id === "setting") {
                //console.log('跳转setting页------------>')
                Router.push('/settings', { "from": "homepage" });
            }
            //-- android 351 的板子使用鼠标点击无法自动触发焦点切换，此处做为兼容处理
            SN.focus(elem);
        }
    }

    function gamesFocusEvent() {
        this.back = function() {

        }
        this.focusClick = function(elem) {

            //-- 获取第一个
            var url = elem.getAttribute("url");
            if (url) {
                Router.setLastFocus();
                Fun.locationPush(url)
            }

        }
    }

    function recommendedFocusEvent() {
        this.back = function() {

        }
        this.focusClick = function(elem) {
            try {
                //-- 判断当前点击的位置
                var $this = $(elem).first();
                var $parent = $this.parent();
                //-- 可视区域
                var scrollContent = $parent.parent();
                //-- 当前item 距离容器的left距离
                var positionLeft = $this.position().left;
                //-- 当前item的宽
                var outerWidth = parseInt($this.outerWidth());
                if (positionLeft < 0 || positionLeft + outerWidth > scrollContent.innerWidth()) {
                    return;
                } else {
                    //-- 获取第一个
                    var url = elem.getAttribute("url");
                    if (url) {
                        Router.setLastFocus();
                        Fun.locationPush(url)
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    function bookmarksFocusEvent() {
        this.initFocus = function() {
                SN.add({
                    id: 'h_bookmarks',
                    selector: '#h_bookmarks .focusable',
                    // enterTo: 'last-focused',
                    straightOnly: 'true',
                    leaveFor: {
                        up: '#bookmarks'
                    }
                });

                $('#h_bookmarks .focusable')
                    .off("sn:willfocus")
                    .on('sn:willfocus', function(e) {
                        SN.pause();
                        $(this).ensureHorizontal(function() {
                            SN.focus(this);
                            SN.resume();
                        });
                        //-- 分页焦点
                        var index = $(this).index() + 1;
                        var page = Math.ceil(index / 5) - 1;

                        $("#h_bookmarks_page")
                            .children()
                            .removeClass("page-active")
                            .eq(page)
                            .addClass("page-active")

                        //--切换 tab 半焦点状态
                        var id = $(this).parent().parent().attr('id');
                        var ids = id && id.split("_");
                        ids[1] && $('#' + ids[1]).next().addClass("current")
                    })

                $('#h_bookmarks .focusable')
                    .off("sn:enter-down")
                    .on('sn:enter-down', function(e) {
                        var sectionId = SN.getSectionId(this)
                        hash_map.get(sectionId).focusClick(this);
                    });
                SN.makeFocusable();
                addEvent();
            }
            //-- 开启点击监听
        this.onclickEvent = function() {
            $('#h_bookmarks_page div')
                .off("click")
                .on("click", function() {
                    var page = $(this).attr("page");
                    if (!$(this).hasClass("page-active")) {
                        var index = parseInt((page - 1) * 5);
                        var _elem = $(".h-bookmarks-list").children().eq(index);
                        _elem && SN.focus(_elem);
                    }
                })
        }
        this.initElements = function(data) {
            //console.log('渲染bookmarks页面-------------->');
            var bookmarks_count;
            var bookmarks_page_count;
            var color_arr = ["#3473E2", "#FD9827", "#59ADEA", "#D21626", "#3D5B96"]
                //-- 初始化bookmark列表
            document.getElementById("h_bookmarks").innerHTML = '';
            bookmarks_count = data.length;
            if (bookmarks_count < 5) bookmarks_count = 5;
            bookmarks_page_count = Math.ceil((bookmarks_count) / 5);
            // -- 添加bookmarks列表滑动容器
            var bookmarks_dom = document.createElement('div');
            bookmarks_dom.classList.add('h-bookmarks-list');
            document.getElementById("h_bookmarks").appendChild(bookmarks_dom);

            var bookmarks_data;
            for (var i = 0; i < bookmarks_count; i++) {
                //-- 当数量少于5个时，剩下的补虚位
                if (data[i]) {
                    bookmarks_data = data[i];
                    //-- 去除https 或者 http
                    var title = bookmarks_data.title
                    var url = bookmarks_data['url'].replace(/(http|https):\/\//g, '').replace(/www\./, '');
                    //-- 截取域名和域名首字母
                    var domain = url.split("/")[0];
                    var domainArr = domain.split(".");
                    var le = domainArr.length > 2 ? domainArr[1] : domainArr[0];
                    var begins = le.substr(0, 1).toUpperCase();
                    var element = document.createElement('div');
                    element.classList.add("focusable");
                    element.style.background = color_arr[i % 5];
                    element.setAttribute("url", bookmarks_data['url']);
                    element.innerHTML = '<div class="h-bookmarks-begins pointer-events" style="color:' + color_arr[i % 5] + '">' + begins + '</div><div class="h-bookmarks-domain pointer-events">' + le + '</div><div class="h-bookmarks-url pointer-events row-center"><p>' + title + '</p></div>'
                    bookmarks_dom.appendChild(element);
                } else {
                    var element = document.createElement('div');
                    element.style.border = "0.1rem solid rgba(138,142,167,0.2)";
                    element.innerHTML = '<div class="h-bookmarks-begins pointer-events" style="background:none;border:0.1rem solid rgba(138,142,167,0.2)"></div>'
                    bookmarks_dom.appendChild(element);
                }
            }

            //-- 添加bookmarks 分页容器
            var bookmarks_page_dom = document.createElement('div');
            bookmarks_page_dom.classList.add('h-bookmarks-page');
            bookmarks_page_dom.setAttribute("id", "h_bookmarks_page");
            document.getElementById("h_bookmarks").appendChild(bookmarks_page_dom);
            for (var i = 1; i <= bookmarks_page_count; i++) {
                //-- 创建 bookmarks 底部分页
                var bookmarks_page_element = document.createElement("div");
                if (i === 1) {
                    bookmarks_page_element.classList.add("page-active");
                }
                bookmarks_page_element.setAttribute("page", i);
                bookmarks_page_dom.appendChild(bookmarks_page_element);
            }
            //-- 异步开启bookmarks页面监听
            hash_map.get('h_bookmarks').onclickEvent();
            hash_map.get('h_bookmarks').initFocus();
        }
        this.back = function() {

        }
        this.focusClick = function(elem) {
            try {
                //-- 判断当前点击的位置
                var $this = $(elem).first();
                var $parent = $this.parent();
                //-- 可视区域
                var scrollContent = $parent.parent();
                //-- 当前item 距离容器的left距离
                var positionLeft = $this.position().left;
                //-- 当前item的宽
                var outerWidth = parseInt($this.outerWidth());
                if (positionLeft < 0 || positionLeft + outerWidth > scrollContent.innerWidth()) {
                    return;
                } else {
                    //-- 获取第一个
                    var url = elem.getAttribute("url");
                    if (url) {
                        Router.setLastFocus();
                        Fun.locationPush(url);
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    //-- 初始化 html 
    function initHtml() {
        var temp_node = document.createElement('div');
        temp_node.innerHTML = homepageView;
        var homepage_dom = temp_node.firstChild;
        if (!document.getElementById("homepage_container")) {
            document.getElementById("container").appendChild(homepage_dom);
        }
    }
    //-- 填充数据
    function fillData() {
        //-- 填充tab栏数据
        document.getElementById("recommended").innerHTML = language['home-recommended'];
        document.getElementById("bookmarks").innerHTML = language['home-bookmarks'];
        document.getElementById("h_search_title").innerHTML = language['home-search-input'];
        document.getElementById("games").innerHTML = "Games";

        getRecommendedData().then(function(data) {
            var recommend_data = data;
            //-- 填充recommended数据
            var recommended_doms = document.getElementById("h_recommended").querySelectorAll(".focusable");
            var imageL = Fun.getImageL();
            for (var i = 0; i < recommended_doms.length; i++) {
                var item = recommended_doms[i];
                if (recommend_data.list[i]) {
                    item.innerHTML = '<img class="pointer-events" src="app/image/recommended/' + imageL + '/' + recommend_data.list[i].img + '" />';
                    item.setAttribute("url", recommend_data.list[i].url);
                } else {
                    item.parentNode.removeChild(item);
                }
            }
        })

        //--游戏数据
        var games_data = getGamesData();
        var games_doms = document.getElementById("h_games").querySelectorAll(".focusable");
        for (var i = 0; i < games_doms.length; i++) {
            var item = games_doms[i];
            if (games_data[i]) {
                item.innerHTML = '<img class="pointer-events" src="app/image/games/' + games_data[i].img + '" />';
                item.setAttribute("url", games_data[i].url);
            } else {
                item.parentNode.removeChild(item);
            }
        }
    }
    //-- 获取游戏数据
    function getGamesData() {
        // Oil Hunt   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db3563
        // Kill The Spy   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5f1a99f191322
        // Kids Cute Pairs   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db0683
        // Magic Match   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5f3cfa82801e0
        // Cricket World Cup   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5f1a836decea4
        // Spot The Patterns   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5f1a9b7b6d8d1
        // Village Story   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db3d33
        // Sumo Saga   http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db394b

        // Piggy Night http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef1964f2cb3f

        // Pingu and Friends http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef1964f2cb3g

        var req = [
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db3563', 'img': 'OilHunt.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db0683', 'img': 'KidsCutePairs.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5f1a9b7b6d8d1', 'img': 'SpotThePatterns.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db394b', 'img': 'SumoSaga.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db21db&v=1.1', 'img': 'FruitBomb.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5f1a99f191322', 'img': 'KillTheSpy.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef0471db3d33', 'img': 'VillageStory.webp' },
            { 'url': 'http://metax-content.c2vyyxboawmtzmf2b3jpdgvz.com/index?c=5ef1964f2cb3f&v=1.0', 'img': 'PiggyNight.webp' },
        ]
        return req
    }
    //-- 获取12宫格数据
    function getRecommendedData() {
        //console.log('api: 获取九宫格数据 ----------->');
        var params = { duid: '111', token: '111' }
        var option = {
            url: 'index.php',
            type: 'GET',
            dataType: 'json',
            data: params
        }
        return network.send(option).then(function(request) {
            var req = JSON.parse(request);
            return { index: 1, list: req }
        }).catch(function() {
            if (window.sraf) {
                var req = [
                    { 'url': 'https://www.wikipedia.org/', 'img': '1.webp' },
                    { 'url': 'https://www.facebook.com', 'img': '2.webp' },
                    { 'url': 'https://www.instagram.com', 'img': '3.webp' },
                    { 'url': 'http://www.amazon.com', 'img': '4.webp' },
                    { 'url': 'http://www.booking.com', 'img': '5.webp' },
                    { 'url': 'https://www.bing.com', 'img': '6.webp' },
                    { 'url': 'http://www.agoda.com', 'img': '7.webp' },
                    { 'url': 'https://www.google.com', 'img': '8.webp' },
                    { 'url': 'https://twitter.com', 'img': '9.webp' },
                    { 'url': 'https://www.youtube.com', 'img': '10.webp' },
                    { 'url': 'http://www.bbc.com', 'img': '11.webp' },
                    { 'url': 'https://www.flickr.com', 'img': '12.webp' },
                ]
            } else {
                var req = [
                    // {'url':'https://www.yandex.ru/?clid=2334174','img':'yandex.webp'},
                    { 'url': 'https://www.wikipedia.org/', 'img': '1.webp' },
                    { 'url': 'https://www.facebook.com', 'img': '2.webp' },
                    { 'url': 'https://www.instagram.com', 'img': '3.webp' },
                    { 'url': 'http://www.amazon.com', 'img': '4.webp' },
                    { 'url': 'http://www.booking.com', 'img': '5.webp' },
                    { 'url': 'https://www.bing.com', 'img': '6.webp' },
                    { 'url': 'http://www.agoda.com', 'img': '7.webp' },
                    { 'url': 'https://www.google.com', 'img': '8.webp' },
                    { 'url': 'https://twitter.com', 'img': '9.webp' },
                    { 'url': 'https://www.youtube.com', 'img': '10.webp' },
                    { 'url': 'http://www.bbc.com', 'img': '11.webp' },
                    { 'url': 'https://www.flickr.com', 'img': '12.webp' },
                ]
            }
            return { index: 1, list: req }
        });
    }

    //-- 确认当前焦点位置
    function checkFocus() {
        var path = location.pathname;
        var _uid = sessionStorage.getItem(path);
        if (_uid) {
            var sectionId = _uid.split('-')[0];

            if (sectionId && sectionId == 'h_tab') {
                SN.focus($("[_uid=" + _uid + "]"));
                return;
            }

            if (sectionId && sectionId == 'h_recommended') {
                SN.focus($("#recommended"));
                return;
            }

            if (sectionId && sectionId == 'h_bookmarks') {
                SN.focus($("#bookmarks"));
                return;
            }

            if (sectionId && sectionId == 'h_games') {
                SN.focus($("#games"));
                return;
            }
        }
        SN.focus();
    }
    //-- 初始化主页焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            // 头部
            SN.add({
                id: 'h_tab',
                selector: '#h_tab .focusable',
                enterTo: 'last-focused',
                leaveFor: {
                    down: ".h-content .display-block .focusable:first"
                }
            });
            //-- recommend
            SN.add({
                id: 'h_recommended',
                selector: '#h_recommended .focusable',
                // enterTo: 'last-focused',
                straightOnly: 'true',
                leaveFor: {
                    up: '#recommended'
                }
            });

            //-- games
            SN.add({
                id: 'h_games',
                selector: '#h_games .focusable',
                straightOnly: 'true',
                leaveFor: {
                    up: '#games'
                }
            })

            //-- 导航栏切换
            $('#h_tab .focusable')
                .off('sn:willfocus')
                .on('sn:willfocus', function(e) {
                    var id = this.id;
                    if (id == 'recommended' || id == "bookmarks" || id == "games") {
                        $('.h-content > div')
                            .removeClass('display-block')
                            .filter('#h_' + this.id)
                            .addClass("display-block");

                        $("#h_tab .current").removeClass("current");
                    }
                })

            // recommend 动画
            $('#h_recommended .focusable')
                .off('sn:willfocus')
                .on('sn:willfocus', function(e) {
                    SN.pause();
                    $(this).ensureHorizontal(function() {
                        SN.focus(this);
                        SN.resume();
                    });
                    //--切换 tab 半焦点状态
                    var id = $(this).parent().parent().attr('id');
                    var ids = id && id.split("_");
                    ids[1] && $('#' + ids[1]).next().addClass("current")

                    //--切换 显示 和 隐藏 状态
                    if (!$("#h_recommended").hasClass("display-block")) {
                        $('.h-content > div')
                            .removeClass('display-block')
                            .filter('#h_recommended')
                            .addClass("display-block");
                    }
                    return false;
                })

            //-- games
            $('#h_games .focusable')
                .off('sn:willfocus')
                .on('sn:willfocus', function(e) {
                    //--切换 tab 半焦点状态
                    var id = $(this).parent().parent().attr('id');
                    var ids = id && id.split("_");
                    ids[1] && $('#' + ids[1]).next().addClass("current")

                    //--切换 显示 和 隐藏 状态
                    if (!$("#h_games").hasClass("display-block")) {
                        $('.h-content > div')
                            .removeClass('display-block')
                            .filter('#h_games')
                            .addClass("display-block");
                    }
                })

            //-- 判断tab 栏循环
            var rtl = $("#container").attr("dir");
            if (rtl) {
                $("#setting").attr("data-sn-left", "#recommended")
                $("#recommended").attr("data-sn-right", "#setting")
            } else {
                $("#setting").attr("data-sn-right", "#recommended")
                $("#recommended").attr("data-sn-left", "#setting")
            }

            SN.makeFocusable();
            checkFocus();
        })
    }

    //-- 初始化书签栏
    function initBookmark() {
        //-- 判断bookmarks页面是否渲染完成
        try {
            if (window.jsUtil || window.sraf) {
                getBookmarks();
            } else {
                var data = [
                    { 'time': '1584614785968', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584604785968.808105', 'url': 'http://booking.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584514785968.808105', 'url': 'http://www.goole.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584414785968.808105', 'url': 'http://www.bbc.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584314785968.808105', 'url': 'http://www.lanhuapp1111.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584214785968.808105', 'url': 'http://www.fanyi.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584614785968', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584604785968.808105', 'url': 'http://booking.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584514785968.808105', 'url': 'http://www.goole.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584414785968.808105', 'url': 'http://www.bbc.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584314785968.808105', 'url': 'http://www.lanhuapp1111.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584214785968.808105', 'url': 'http://www.fanyi.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584614785968', 'url': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584604785968.808105', 'url': 'http://booking.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584514785968.808105', 'url': 'http://www.goole.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584414785968.808105', 'url': 'http://www.bbc.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584314785968.808105', 'url': 'http://www.lanhuapp1111.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                    { 'time': '1584214785968.808105', 'url': 'http://www.fanyi.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' }
                ];
                hash_map.get("h_bookmarks").initElements(data);
            }
        } catch (e) {
            console.log(e);
            return;
        }
    }

    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#homepage_container .focusable')
            .off("sn:enter-back")
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#homepage_container .focusable')
            .off("sn:enter-down")
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#homepage_container .focusable')
            .off("sn:enter-click")
            .on('sn:enter-click', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }

    var render = function() {
        if (!state.isRender) {
            initHtml();
            fillData();
        }
        initBookmark();
    }
    var addEvent = function() {
        focusInit();
        onEnterEvent();
        onBackEvent();
        if (!window.sraf) {
            onClickEvent();
        }
        state.isRender = true
    }
    return { render: render, addEvent: addEvent }
});