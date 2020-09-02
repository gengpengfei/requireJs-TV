define(['jquery', 'navigation', 'text!view/selbookmarkpageView.html', 'unity/network', 'unity/historyRouter', 'i18n!../nls/language', 'css!style/selbookmarkpage.css'], function($, SN, selbookmarkpageView, network, Router, language) {
    'use strict';

    function setSelBookmark(data) {
        if (window.sraf) {
            window.sraf.storage.addBatchBookmarks(JSON.stringify(data))
        }
        if (window.jsUtil) {
            window.jsUtil.addCollects(JSON.stringify(data))
        }
    }

    function noticeSdk() {
        if (window.sraf) {
            window.sraf.storage.importBookmark();
        }
        if (window.jsUtil) {
            window.jsUtil.importBookmark();
        }
    }
    var hash_map = new Map();
    hash_map.set('sel_bookmark', new selBookmarkFocusEvent())
    hash_map.set('sel_check', new submitFocusEvent())

    function selBookmarkFocusEvent() {
        this.back = function() {
            setTimeout(function() {
                SN.focus();
            }, 100)
        }
        this.initFocus = function() {
            SN.add({
                id: 'sel_bookmark',
                selector: '.sel-bookmark-list .focusable',
            });
            SN.makeFocusable();
        }
        this.initElement = function(data) {
            var _elem = '';
            for (var i = 0; i < data.length; i++) {
                var url = data[i].url;
                var title = data[i].title;
                var _url = url.replace(/(http||https):\/\//g, '').replace(/www\./, '');
                _elem += '<div class="sel-bookmark-item active row-between focusable" url="' + url + '" title="' + title + '"><div class="sel-bookmark-title">' + _url + '</div><div class="sel-check-button row-center"><img src="app/image/common/save.webp"/></div></div>'
            }
            $(".sel-bookmark-list").html(_elem);
            this.initFocus();
            addEvent();
        }
        this.focusClick = function(elem) {
            $(elem).toggleClass("active");
        }
    }

    function submitFocusEvent() {
        this.back = function() {
            setTimeout(function() {
                SN.focus();
            }, 100)
        }
        this.focusClick = function(elem) {
            try {
                if ($(elem).hasClass('sel-next-button')) {
                    var checks = $('.sel-bookmark-list').find(".active");
                    var data = [];
                    for (var i = 0; i < checks.length; i++) {
                        var url = $(checks[i]).attr("url");
                        var title = $(checks[i]).attr("title")
                        data.push({ url: url, title: title })
                    }
                    //-- 对接底层数据
                    setSelBookmark(data)
                }
                //-- 通知客户端用户已选择
                noticeSdk();
                //-- 兼容android跳转之后，返回参数不更新问题
                if (window.jsUtil) {
                    window.jsUtil.replaceHome();
                } else {
                    Router.replace('/')
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    //-- 首页初始化布局
    function initHtml() {
        var temp_node = document.createElement('div');
        temp_node.innerHTML = selbookmarkpageView;
        var selbookmarkpage_dom = temp_node.firstChild;
        if (!document.getElementById("selbookmarkpage_container")) {
            document.getElementById("container").appendChild(selbookmarkpage_dom);
        }
    }

    //-- 填充数据
    function fillData() {
        //-- 填充title栏数据
        $("#sel_title").html(language['sel-title']);
        $(".sel-next-button").html(language['sel-next']);
        $(".sel-skip-button").html(language['sel-skip'] + ' >');

        getRelBookmarksData().then(function(data) {
            hash_map.get("sel_bookmark").initElement(data)
        })
    }

    function getRelBookmarksData() {
        var params = {}
        var option = {
            url: 'index.php',
            type: 'GET',
            dataType: 'json',
            data: params
        }
        return network.send(option).then(function(request) {
            var req = JSON.parse(request);
            return req
        }).catch(function() {
            var req = [
                { 'url': 'https://www.google.com', 'title': 'google' },
                { 'url': 'https://www.facebook.com', 'title': 'facebook' },
                { 'url': 'https://www.instagram.com', 'title': 'instagram' },
                { 'url': 'https://www.amazon.com', 'title': 'amazon' },
                { 'url': 'https://www.youtube.com/', 'title': 'youtube' },
                { 'url': 'https://twitter.com/', 'title': 'twitter' },
            ]
            return req
        });
    }

    //-- 初始化页面焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'sel_check',
                selector: '.sel-footer .focusable',
            });
            SN.makeFocusable();
            SN.focus(".sel-next-button");
        })
    }

    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#selbookmarkpage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#selbookmarkpage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 back 监听
    function onBackEvent() {
        $('#selbookmarkpage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    var render = function() {
        initHtml();
        fillData();
    }
    var addEvent = function() {
        focusInit();
        onEnterEvent();
        onBackEvent();
        if (!window.sraf) {
            onClickEvent();
        }
    }
    return { render: render, addEvent: addEvent }
});