define(['jquery', 'navigation', 'text!view/historypageView.html', 'i18n!../nls/language', 'unity/commonFun', 'unity/historyRouter', 'css!style/settingpage.css', 'animation'], function($, SN, historypageView, language, Fun, Router) {
    'use strict';
    //-- 装载 historypage模块
    if (window.sraf) {
        window.sraf.addEventListener("query_history", getHistoryByLinux);
    }

    function getHistoryByLinux(e) {
        var data = e.slice(0, 100);
        hash_map.get("his_history").initElement(data);
    }

    function getHistory() {
        try {
            if (window.sraf) {
                sraf.storage.queryHistory("", 0);
            }
            if (window.jsUtil) {
                var data = window.jsUtil.queryHistory(0, 100);
                hash_map.get("his_history").initElement(JSON.parse(data));
            }
        } catch (e) {
            console.log(e);
        }
    }

    function historyDelete(dom) {
        var url = $(dom).attr('url');
        var time = $(dom).attr('time');
        if (window.sraf) {
            window.sraf.storage.deleteHistory(url, parseFloat(time))
        }
        if (window.jsUtil) {
            //-- 暂时无法实现  
            window.jsUtil.deleteHistoryByUrl(url);
        }
    }

    function clearAllHistory() {
        if (window.sraf) {
            window.sraf.storage.deleteAllHistory();
        }
        if (window.jsUtil) {
            window.jsUtil.clearHistory();
        }
    }

    function goBack() {
        //-- 由于清空历史记录会清空历史栈
        if (window.history.length > 1) {
            window.history.go(-1);
        } else {
            Router.replace('/')
        }
    }
    var hash_map = new Map()
    hash_map.set('his_history', new historyFocusEvent())
    hash_map.set('his_clear', new clearFocusEvent())

    function historyFocusEvent() {
        this.prefix = 'his_history';
        this.initFocus = function() {
            SN.add({
                id: 'his_history',
                selector: '#his_history .focusable',
                enterTo: 'last-focused',
                straightOnly: true,
                defaultElement: '#his_history .focusbale:first'
            });

            // 焦点切换显示和隐藏删除按钮 以及 动画
            $('#his_history .focusable')
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
        this.initElement = function(data) {
            if (data.length < 1) return;
            //-- 填充history 栏数据
            var html = '';
            //-- 此处为了后期优化，按天显示历史记录
            var list = {};
            for (var i = 0; i < data.length; i++) {
                data[i]['index'] = i + 1;
                var time = data[i]['time'] ? data[i]['time'].toString().substr(0, 13) : null;
                data[i]['times'] = time;

                var date = time ? new Date(parseInt(time)).format("yyyy/MM/dd") : '0000/00/00';
                if (!list[date]) {
                    list[date] = [data[i]];
                } else {
                    list[date].push(data[i])
                }
            }
            Object.keys(list).forEach(function(i) {
                html += '<div class="his-history-item row-center" style="font-size:1.3rem">' + i + '</div>'
                for (var e = 0; e < list[i].length; e++) {
                    var url = list[i][e]['url'];
                    var title = list[i][e]['title'];
                    var time = list[i][e]['time'];
                    var times = list[i][e]['times'];
                    times = times ? new Date(parseInt(times)).format("hh:mm:ss") : '00/00 00:00';
                    //-- 截取域名和域名首字母
                    var domainUrl = url.replace(/(http|https):\/\//g, '').replace(/www\./g, '');
                    var domain = url.replace(/(http|https):\/\//g, '').split("/")[0];
                    var le = domain.replace(/www./g, '').split(".")[0];
                    var begins;
                    if (le) {
                        begins = le.substr(0, 1).toUpperCase();
                    } else {
                        begins = '?';
                    }
                    html += '<div class="his-history-item row-between">'
                    html += '<div class="his-history-li row-start focusable" time="' + time + '" url="' + url + '">'
                    html += '<div>' + times + '</div><div>' + begins + '</div><div>' + domainUrl + '</div><div>' + title + '</div>'
                    html += '</div>'
                    html += '<div class="his-history-del row-center focusable"><img src="app/image/common/delete.webp"/></div>'
                    html += '</div>';
                }
            })
            var history_list = document.getElementById('his_history');
            history_list.innerHTML = html;
            this.initFocus();
        }
        this.back = function() {
            goBack();
        }
        this.focusClick = function(elem) {
            try {
                if ($(elem).hasClass("his-history-li")) {
                    //-- 跳转
                    var url = $(elem).attr("url");
                    Fun.locationPush(url)
                }
                if ($(elem).hasClass("his-history-del")) {
                    var nextElem;
                    if ($(elem).parent().next().length > 0) {
                        //-- 向下删除
                        nextElem = $(elem).parent().next().children(':last-child');
                    } else if ($(elem).parent().prev().length > 0) {
                        //-- 向上删除
                        nextElem = $(elem).parent().prev().children(':last-child');
                    } else {
                        //-- 删完了
                        nextElem = $("#his_clear .focusable");
                    }
                    //-- 对接终端数据
                    historyDelete($(elem).prev());

                    SN.focus(nextElem);

                    setTimeout(function() {
                        $(elem).parent().remove();
                    })
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    function clearFocusEvent() {
        this.prefix = 'his_clear';
        this.back = function() {
            goBack();
        }
        this.focusClick = function(elem) {
            try {
                SN.pause();
                new Msg({
                    content: language["history-clear"] + '?',
                    confirm: function() {
                        //-- 底层接口对接
                        try {
                            clearAllHistory();
                            document.getElementById("his_history").innerHTML = null;
                            setTimeout(function() {
                                SN.focus("his_clear")
                                SN.resume();
                            })
                        } catch (e) {
                            return;
                        }
                    },
                    cancle: function() {
                        setTimeout(function() {
                            SN.focus("his_clear")
                            SN.resume();
                        })
                    }
                })
            } catch (e) {
                console.log(e);
            }
        }
    }

    //-- 首页初始化布局
    function initHtml() {
        //console.log('historypage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = historypageView;
        var historypage_dom = temp_node.firstElementChild;
        if (!document.getElementById("historypage_container")) {
            document.getElementById("container").appendChild(historypage_dom);
        }
    }
    //-- 填充数据
    function fillData() {
        //-- 填充title栏数据
        document.getElementById("his_title").innerHTML = language['history-title'];
        document.getElementById("his_history_clear_title").innerHTML = language['history-clear']
    }
    //-- 初始化页面焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'his_clear',
                selector: '#his_clear .focusable',
                straightOnly: true,
                enterTo: 'last-focused'
            });

            $('#his_clear .focusable')
                .off("sn:willfocus")
                .on('sn:willfocus', function() {
                    $("#his_history").children().removeClass("transform-focus");
                    //-- 初始化history list 偏移量
                    $("#his_history").css("transform", "translateY(0px)");
                })

            SN.makeFocusable();
            SN.focus();
        })
    }

    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#historypage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#historypage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#historypage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的滚轮事件
    function onMousewheel() {
        $('#historypage_container')
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
        fillData();
        if (window.sraf || window.jsUtil) {
            getHistory();
        } else {
            //-- 测试
            var data = '[{"id":10,"time":1590395959750,"title":"1Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":11,"time":1590385919750,"title":"2Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":10,"time":1590375829750,"title":"3Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":11,"time":1590355739750,"title":"4Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":10,"time":1590345649750,"title":"5Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":11,"time":1590335559750,"title":"6Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":10,"time":1590325469750,"title":"7Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":11,"time":1590315379750,"title":"8Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":10,"time":1590305289750,"title":"9Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"},{"id":11,"time":1590305199750,"title":"0Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books, DVDs \u0026 more","url":"https://www.amazon.com/12312313"}]';
            data = JSON.parse(data);
            hash_map.get("his_history").initElement(data);
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