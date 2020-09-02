define(['jquery', 'navigation', 'unity/historyRouter', 'text!view/settingpageView.html', 'i18n!nls/language', 'css!style/settingpage.css', 'plugin/msg/index'], function($, SN, Router, settingpageView, language) {
    var state = {
        isRender: false
    }

    var s_hash_map = new Map();
    s_hash_map.set('s_setting', new settingFocusEvent());

    function settingFocusEvent() {
        this.prefix = 's_setting';
        this.back = function() {
            $('#settingpage_container .focusable').off("sn:enter-back");
            $('#settingpage_container .focusable').off('sn:enter-down')
            $('#settingpage_container .focusable').off('sn:enter-click')
            window.history.go(-1);
        }
        this.focusClick = function(elem) {
            var route = $(elem).attr('router');
            switch (route) {
                case 'history':
                    Router.push("history");
                    break;
                case 'bookmark':
                    Router.push("bookmark");
                    break;
                case 'privacy':
                    Router.push("privacy");
                    break;
                case 'account':
                    Router.push("account");
                    break;
                case 'security':
                    Router.push("security");
                    break;
                case 'about':
                    Router.push("about");
                    break;
            }
        }
    }

    //-- 填充html
    function initHtml() {
        var temp_node = document.createElement('div');
        temp_node.innerHTML = settingpageView;
        var settingpage_dom = temp_node.firstChild;
        if (!state.isRender && !document.getElementById("settingpage_container")) {
            document.getElementById("container").appendChild(settingpage_dom);
        }
    }
    //-- 填充数据
    function fillData() {
        //-- 填充title栏数据
        $("#s_title").html(language['setting-title']);
        //-- 填充setting 栏数据
        $("#setting_history_title").html(language['setting-history']);
        $("#setting_bookmark_title").html(language['setting-bookmarks']);
        $("#setting_privacy_title").html(language['setting-privacy']);
        // $("#setting_account_title").html(language['setting-account']);
        $("#setting_security_title").html(language['setting-security']);
        $("#setting_about_title").html(language['setting-about']);
    }
    //-- 初始化主页焦点
    function focusInit() {
        $(function() {
            SN.init();
            SN.add({
                id: 's_setting',
                selector: '#s_setting .focusable',
                enterTo: 'last-focused',
                straightOnly: 'true',
            });

            //-- 判断 setting 栏循环
            var rtl = $("#container").attr("dir");
            if (rtl) {
                $("#router_security").attr("data-sn-left", "#router_about")
                $("#router_about").attr("data-sn-right", "#router_security")
                $("#router_about").attr("data-sn-left", "#router_history")
                $("#router_history").attr("data-sn-right", "#router_about")
            } else {
                $("#router_security").attr("data-sn-right", "#router_about")
                $("#router_about").attr("data-sn-left", "#router_security")
                $("#router_about").attr("data-sn-right", "#router_history")
                $("#router_history").attr("data-sn-left", "#router_about")
            }

            SN.makeFocusable();
            SN.focus();
        })
    }
    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#settingpage_container .focusable')
            .off("sn:enter-back")
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                s_hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#settingpage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                s_hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#settingpage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function(e) {
                var sectionId = SN.getSectionId(this)
                s_hash_map.get(sectionId).focusClick(this);
            });
    }

    //-- 添加全局
    var render = function() {
        if (state.isRender) {
            return;
        }
        initHtml();
        fillData();
        state.isRender = true
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
})