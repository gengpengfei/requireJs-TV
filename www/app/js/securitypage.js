define(['jquery', 'navigation', 'text!view/securitypageView.html', 'i18n!../nls/language', 'css!style/settingpage.css', 'animation'], function($, SN, securitypageView, language) {
    'use strict';

    function getAdsData() {
        if (window.sraf) {
            window.sraf.addEventListener("getSiteBlockDomain", getSiteBlockByLinux);
            window.sraf.storage.getSiteblockDomain(2);
        }
    }

    function getWebpageData() {
        if (window.sraf) {
            window.sraf.addEventListener("getSiteBlockDomain", getSiteBlockByLinux);
            window.sraf.storage.getSiteblockDomain(1);
        }
        if (window.jsUtil) {
            var data = window.jsUtil.querySiteBlockDomains();
            hash_map.get("sec_webpage").initElement(JSON.parse(data));
        }
    }

    function getAdsDisableAllPopupSelect() {
        if (window.sraf) {
            var result = window.sraf.storage.isAllPopWindowBlock();
            var userSelect = result === '1' ? 1 : 0;
            hash_map.get("sec_ads").initUserSelect(userSelect);
        }
    }

    function setDisabledAllPopupSelect(select) {
        if (window.sraf) {
            if (select == 1) {
                window.sraf.storage.addAllPopWindowBlock();
            } else {
                window.sraf.storage.deleteAllPopWindowBlock()
            }
        }
    }

    function getSiteBlockByLinux(e) {
        if (e.blocktype == 1) {
            hash_map.get("sec_webpage").initElement(e.siteblockdomain);
        }
        if (e.blocktype == 2) {
            hash_map.get("sec_ads").initElement(e.siteblockdomain);
        }
    }

    function webpageDelecte(dom) {
        var url = $(dom).attr('url');
        if (window.sraf) {
            window.sraf.storage.deleteSiteblockByDomain(url, 1)
        }
        if (window.jsUtil) {
            jsUtil.deleteSiteBlockDomain(url)
        }
    }

    function adsDelecte(dom) {
        var url = $(dom).attr('url');
        if (window.sraf) {
            window.sraf.storage.deleteSiteblockByDomain(url, 2)
        }
    }
    //-- 首页初始化布局
    function initHtml() {
        //console.log('securitypage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = securitypageView;
        var securitypage_dom = temp_node.firstChild;
        if (!document.getElementById("securitypage_container")) {
            document.getElementById("container").appendChild(securitypage_dom);
        }
    }
    //-- 填充文字
    function fillTitle() {
        document.getElementById("sec_title").innerHTML = language['security-title'];
        //-- 填充说明
        document.getElementById("sec_ads_title").innerHTML = language["security-disabled-all-popup"]
        document.getElementById("sec_security_ads_title").innerHTML = language['security-popup-disabled'] + ' ( 0 )';

        document.getElementById("sec_webpage_title").innerHTML = language['security-website-disabled'];
        document.getElementById("sec_security_webpage_title").innerHTML = language['security-website-disabled'] + ' ( 0 )';
    }

    var hash_map = new Map();
    hash_map.set('sec_security', new securityFocusEvent())
    hash_map.set('sec_ads', new adsFocusEvent())
    hash_map.set('sec_webpage', new webpageFocusEvent())

    function webpageFocusEvent() {
        this.initFocus = function() {
            SN.add({
                id: 'sec_webpage',
                selector: '#sec_webpage .focusable',
                restrict: 'self-only',
                enterTo: 'last-focused'
            });

            // 焦点切换显示和隐藏删除按钮 以及 动画
            $('#sec_webpage .focusable')
                .off("sn:willfocus")
                .on('sn:willfocus', function() {
                    SN.pause();
                    $(this).ensureVertical(function() {
                        SN.focus(this);
                        SN.resume();
                    });
                    //--切换 显示 和 隐藏 状态
                    $(this)
                        .parent()
                        .parent()
                        .children()
                        .removeClass('transform-focus')

                    $(this).parent().addClass("transform-focus");

                    return false;
                })
            addEvent();
        }
        this.initElement = function(webpageData) {
            //-- 更新数量
            if (webpageData.length > 0) document.getElementById("sec_security_webpage_title").innerHTML = language['security-website-disabled'] + ' ( ' + webpageData.length + ' )';
            //-- 填充security webpaeg栏数据
            var webpageHtml = '';
            for (var i = 0; i < webpageData.length; i++) {
                //-- 去除https 或者 http
                var domain = webpageData[i]['domain'];
                webpageHtml += '<div class="sec-security-item row-between"><div class="sec-security-li row-start"><div>' + domain + '</div></div><div class="sec-security-del row-center focusable" url="' + domain + '"><img src="app/image/common/delete.webp"></div></div>';
            }
            var security_list = document.getElementById('sec_webpage_list');
            security_list.innerHTML = webpageHtml;
            this.initFocus();
        }

        this.back = function() {
            $("#sec_webpage").removeClass("show")
            setTimeout(function() {
                SN.focus("#sec_security_webpage")
            })
        }
        this.focusClick = function(elem) {
            try {
                var nextElem;
                if ($(elem).parent().next().length > 0) {
                    //-- 向下删除
                    nextElem = $(elem).parent().next().children(':last-child');
                } else if ($(elem).parent().prev().length > 0) {
                    //-- 向上删除
                    nextElem = $(elem).parent().prev().children(':last-child');
                } else {
                    //-- 删完了
                    nextElem = $("#sec_security_webpage");
                    $("#sec_webpage").removeClass("show")
                }
                //-- 对接终端数据
                webpageDelecte(elem);

                setTimeout(function() {
                    //-- 删除当前条
                    $(elem).parent().remove();
                    //-- 更新数字显示
                    var num = $("#sec_webpage_list").children().length;
                    $("#sec_security_webpage_title").html(language['security-website-disabled'] + ' ( ' + num + ' )');
                    SN.focus(nextElem);
                })
            } catch (e) {
                console.log(e);
            }
        }
    }

    function adsFocusEvent() {
        this.initFocus = function() {
            SN.add({
                id: 'sec_ads',
                selector: '#sec_ads .focusable',
                restrict: 'self-only',
                straightOnly: 'true',
                enterTo: 'last-focused'
            });

            // 焦点切换显示和隐藏删除按钮 以及 动画
            $('#sec_ads .focusable')
                .off("sn:willfocus")
                .on('sn:willfocus', function() {
                    if ($(this).hasClass("sec-security-ads-button")) {
                        $("#sec_ads_list").children().removeClass("transform-focus");
                        //-- 对接底层接口

                    } else {
                        SN.pause();
                        $(this).ensureVertical(function() {
                            SN.focus(this);
                            SN.resume();
                        });
                        //--切换 显示 和 隐藏 状态
                        $(this)
                            .parent()
                            .parent()
                            .children()
                            .removeClass('transform-focus')
                        $(this).parent().addClass("transform-focus");
                    }
                })

            addEvent();
        }
        this.initElement = function(adsData) {
            if (adsData.length > 0) document.getElementById("sec_security_ads_title").innerHTML = language['security-popup-disabled'] + ' ( ' + adsData.length + ' )';
            //-- 填充security ads栏数据
            var adsHtml = '';
            for (var i = 0; i < adsData.length; i++) {
                //-- 去除https 或者 http
                var domain = adsData[i]['domain'];
                adsHtml += '<div class="sec-security-item row-between"><div class="sec-security-li row-start"  ><div>' + domain + '</div></div><div class="sec-security-del row-center focusable" url="' + domain + '"><img src="app/image/common/delete.webp"></div></div>';
            }
            var security_list = document.getElementById('sec_ads_list');
            security_list.innerHTML = adsHtml;
            //-- 兼容少数国家页面翻转
            if ($('#container').attr('dir') == 'rtl') {
                $("#sec_disabled_all_popup .sec-slider").css('margin-right', 'auto');
            }
            this.initFocus()
        }
        this.initUserSelect = function(select) {
            if (select == 1) {
                $("#sec_disabled_all_popup").addClass("check")
            }
        }
        this.back = function() {
            $("#sec_ads").removeClass("show")
            setTimeout(function() {
                SN.focus("#sec_security_ads")
            })
        }
        this.focusClick = function(elem) {
            try {
                if ($(elem).hasClass("sec-security-ads-button")) {
                    $(elem).toggleClass("check");
                    var userSelect = $(elem).hasClass("check") ? 1 : 0;
                    //-- 对接终端数据
                    setDisabledAllPopupSelect(userSelect)
                } else {
                    var nextElem;
                    if ($(elem).parent().next().length > 0) {
                        //-- 向下删除
                        nextElem = $(elem).parent().next().children(':last-child');
                    } else if ($(elem).parent().prev().length > 0) {
                        //-- 向上删除
                        nextElem = $(elem).parent().prev().children(':last-child');
                    } else {
                        //-- 删完了
                        nextElem = $("#sec_security_ads");
                        $("#sec_ads").removeClass("show")
                    }
                    //-- 对接终端数据
                    adsDelecte(elem);

                    setTimeout(function() {
                        //-- 删除当前条
                        $(elem).parent().remove();
                        //-- 更新数字显示
                        var num = $("#sec_ads_list").children().length
                        document.getElementById("sec_security_ads_title").innerHTML = language['security-popup-disabled'] + ' ( ' + num + ' )';
                        SN.focus(nextElem);
                    })
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    function securityFocusEvent() {
        this.back = function() {
            window.history.go(-1);
        }
        this.focusClick = function(elem) {
            try {
                if ($(elem).attr("id") == 'sec_security_ads') {
                    $("#sec_ads").addClass("show")
                    setTimeout(function() {
                        SN.focus("sec_ads")
                    }, 300)
                }
                if ($(elem).attr("id") == 'sec_security_webpage') {
                    if (document.getElementById("sec_webpage_list").hasChildNodes()) {
                        $("#sec_webpage").addClass("show")
                        setTimeout(function() {
                            SN.focus("sec_webpage")
                        }, 300)
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    //-- 初始化页面焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'sec_security',
                selector: '#sec_security .focusable',
                straightOnly: true,
                restrict: 'self-only',
                enterTo: 'last-focused',
            });

            SN.makeFocusable();
            SN.focus("#sec_security_ads");
        })
    }

    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#securitypage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#securitypage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#securitypage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的滚轮事件
    function onMousewheel() {
        $('#securitypage_container')
            .off('mousewheel')
            .on('mousewheel', function(e) {
                if (e.originalEvent.deltaY > 0) {
                    SN.move('down')
                } else {
                    SN.move('up')
                }
            });
    }
    var render = function() {
        initHtml();
        fillTitle();
        //-- android 兼容
        if (window.jsUtil) {
            $("#sec_security_ads").addClass("display-none");
            getWebpageData();
        } else if (window.sraf) {
            getAdsData();
            getWebpageData();
            getAdsDisableAllPopupSelect();
        } else {
            //-- 测试
            var webpageData = [
                { 'domain': 'http://www.baidu.com', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.booking.com', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.goole.com', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.bbc.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.lanhuapp.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.fanyi.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' }
            ];
            setTimeout(function() {
                hash_map.get("sec_webpage").initElement(webpageData);
            }, 3000)

            var adsData = [
                { 'domain': 'http://www.baidu.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.booking.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.goole.com/?ad=1', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.baidu.com', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.booking.com', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' },
                { 'domain': 'http://www.goole.com', 'title': 'Title name redmine seraphic-corp Title name redmine seraphic-corp' }
            ];
            hash_map.get("sec_ads").initElement(adsData);
        }
    }
    var addEvent = function() {
        focusInit();
        onEnterEvent();
        onBackEvent();
        onMousewheel();
        if (!window.sraf) {
            onClickEvent();
        }
    }
    return { render: render, addEvent: addEvent }
});