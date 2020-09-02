define(['jquery', 'navigation', 'text!view/aboutpageView.html', 'i18n!../nls/language', 'unity/historyRouter', 'css!style/settingpage.css', 'plugin/notification/index'], function($, SN, aboutpageView, language, Router) {
    'use strict';

    function getUserSelectLinux(e) {
        if (e.result != 0) return;
        var userSelect = e.limitselect;
        hash_map.get("a_about").initUserSelect(userSelect);
    }

    function getUserSelect() {
        if (window.jsUtil) {
            var userSelect = window.jsUtil.getLimitSelect()
            hash_map.get("a_about").initUserSelect(userSelect);
            return;
        }
        if (window.sraf) {
            window.sraf.removeEventListener("getLimitSelect", getUserSelectLinux);
            window.sraf.addEventListener("getLimitSelect", getUserSelectLinux);
            window.sraf.storage.getLimitSelect();
            return;
        }
    }

    function setUserSelect(userSelect) {
        if (window.jsUtil) {
            window.jsUtil.setLimitSelect(userSelect)
        }
        if (window.sraf) {
            window.sraf.storage.setLimitSelect(userSelect);
        }
    }
    //-- 调用更新弹框
    function checkUpgrade() {
        if (window.jsUtil) {
            window.jsUtil.checkUpgrade()
        }
    }
    //-- 获取SDK版本号
    function getSdkVersion() {
        var sdkVersion = '00.00.000.00.0'
        if (window.jsUtil) {
            sdkVersion = window.jsUtil.getSdkVersion();
        }
        hash_map.get("a_about").initSdkVersion(sdkVersion);
    }
    //-- 获取是否是新版本
    function isLatestVersion() {
        if (window.jsUtil) {
            //-- 是否是最新版本
            var isLatest = window.jsUtil.isLatestVersion();
            hash_map.get("a_about").initIsLatestVersion(isLatest);
        }
    }
    var state = {
        isRender: false
    }
    var hash_map = new Map();
    hash_map.set('a_about', new aboutFocusEvent())

    function aboutFocusEvent() {
        this.back = function() {
            window.history.go(-1);
        }
        this.initUserSelect = function(userSelect) {
            if (userSelect == 1) {
                $(".a-about-select").addClass("check")
                return;
            }
            if (userSelect != 1 && userSelect != 0) {
                $(".a-about-select").parent().css("display", 'none');
            }
        }
        this.initSdkVersion = function(sdkVersion) {
            $("#a_about_version").html(sdkVersion);
        }
        this.initIsLatestVersion = function(initIsLatestVersion) {
            if (!initIsLatestVersion) $("#a_about_is_latest").removeClass("display-none")
        }
        this.focusClick = function(elem) {
            try {
                var id = $(elem).attr('id')
                if (id == 'a_about_update') {
                    if ($("#a_about_is_latest").hasClass("display-none")) {
                        window.spop({
                            template: language['about-lastest-version'] + "!",
                            style: 'info',
                            autoclose: 2000,
                            position: 'bottom-center',
                            icon: false
                        });
                    }
                    checkUpgrade();
                }
                if (id == 'a_about_cookies') {
                    Router.push('/aboutcookies');
                }
                if (id == 'a_about_terms') {
                    Router.push('/aboutterms');
                }
                if (id == 'a_about_privacy') {
                    Router.push('/aboutprivacy');
                }
                if (id == 'a_about_select') {
                    $("#a_check_select").toggleClass("check");
                    //-- 对接gdpr选择
                    var userSelect = $("#a_check_select").hasClass("check") ? 1 : 0;
                    setUserSelect(userSelect)
                }
            } catch (e) {
                console.log(e);
            }
        }
    }
    //-- 首页初始化布局
    function initHtml() {
        //console.log('aboutpage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = aboutpageView;
        var aboutpage_dom = temp_node.firstChild;
        if (!document.getElementById("aboutpage_container")) {
            document.getElementById("container").appendChild(aboutpage_dom);
            //-- 兼容少数国家页面翻转
            if ($('#container').attr('dir') == 'rtl') {
                $(".a-about-select .a-slider").css('margin-right', 'auto');
            }
        }
    }
    //-- 填充文字
    function fillData() {
        document.getElementById("a_title").innerHTML = "OPEN BROWSER";
        if (window.jsUtil) {
            $("#a_about_update").removeClass("display-none")
        }
        document.getElementById("a_about_is_latest").innerHTML = 'new';
        //-- 填充说明
        document.getElementById("a_about_update_title").innerHTML = language["about-check-updates"];
        document.getElementById("a_about_cookies_title").innerHTML = language["about-cookies-policy"];
        document.getElementById("a_about_terms_title").innerHTML = language["about-terms-policy"];
        document.getElementById("a_about_privacy_title").innerHTML = language["about-privacy-policy"];
        document.getElementById("a_about_privacy_select").innerHTML = language["about-policy-desc"];
        document.getElementById("a_about_copyright").innerHTML = "Copyright  2015-2020 SERAPHIC. All rights reserved. ";
    }
    //-- 初始化页面焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'a_about',
                selector: '#a_about .focusable',
                straightOnly: true,
                enterTo: 'last-focused'
            });

            SN.makeFocusable();
            SN.focus();
        })
    }

    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#aboutpage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#aboutpage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function() {
                if (this.id == 'a_about_select') return;
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            })
            .off("sn:enter-up")
            .on("sn:enter-up", function() {
                if (this.id == 'a_about_select') {
                    var sectionId = SN.getSectionId(this)
                    hash_map.get(sectionId).focusClick(this);
                }
            })
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#aboutpage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    var render = function() {
        if (state.isRender) return;
        initHtml();
        fillData();
        try {
            getUserSelect();
            getSdkVersion();
            isLatestVersion();
        } catch (e) {
            console.log('error')
        }
        state.isRender = true;
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