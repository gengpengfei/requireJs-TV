define(['jquery', 'navigation', 'text!view/searchpageView.html', 'i18n!nls/language', 'unity/commonFun', 'css!style/searchpage.css'], function($, SN, searchpageView, language, commonFun) {
    'use strict';
    var state = {
        isRender: false
    }
    var hash_map = new Map();
    hash_map.set('s_search', new searchFocusEvent())
    hash_map.set('s_history', new historyFocusEvent())

    //-- 顶部
    function searchFocusEvent() {
        this.focusClick = function(elem) {
            var id = elem.id;
            if (id === "s_search_button") {
                $("#s_search_input").focus();
            }
            if (id === "s_search_barcode") {
                //console.log('渲染二维码弹框------------>');
            }
        }
        this.back = function() {
            window.history.go(-1);
        }
    }

    function historyFocusEvent() {
        this.focusClick = function(elem) {
            $("#s_search_input").val(null);
            var url = elem.getAttribute("url");
            if (url) window.location.replace(url);
        }
        this.back = function() {
            // $("#s_search_input").blur();
            window.history.go(-1);
        }
    }
    //-- 初始化 html 
    function initHtml() {
        var temp_node = document.createElement('div');
        temp_node.innerHTML = searchpageView;
        var searchpage_dom = temp_node.firstChild;
        if (!document.getElementById("searchpage_container")) {
            document.getElementById("container").appendChild(searchpage_dom);
        }
    }
    //-- 首页填充数据
    function fillData() {
        //-- 填充search input 数据
        document.getElementById("s_search_input").setAttribute('placeholder', language['search-search-input']);
        var history_data = [];
        //-- 测试数据
        history_data = [{ url: 'https://www.google.com', name: 'google' }, { url: 'https://www.facebook.com', name: 'facebook' }, { url: 'https://www.instagram.com', name: 'instagram' }]
        var history_doms = document.getElementById("s_history").querySelectorAll(".focusable");
        for (var i = 0; i < history_doms.length; i++) {
            var item = history_doms[i];
            if (history_data[i]) {
                item.setAttribute("url", history_data[i].url)
                item.firstElementChild.innerHTML = history_data[i].name
            } else {
                item.parentNode.removeChild(item)
            }
        }
    }
    //-- 初始化主页焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 's_search',
                selector: '#s_search .focusable',
                straightOnly: 'true'
            });

            SN.add({
                id: 's_history',
                selector: '#s_history .focusable',
                enterTo: 'last-focused',
            });

            SN.makeFocusable();

            //-- linux 平台由于不能自动弹出键盘，每次将input设置为焦点状态
            if (window.sraf) {
                SN.set('s_history', {
                    leaveFor: {
                        up: "#s_search_input"
                    },
                })
            }
            if (window.sraf) {
                SN.focus($("#s_search_input"));
            } else {
                SN.focus($("#s_search_button"))
            }
        })

        //-- 清空input框
        $("#s_search_input").val(null);
    }
    //-- 监听 search input 重新弹出键盘或者跳转
    function onInputEvent() {
        $("#s_search_input")
            .off("keydown")
            .on('keydown', function(e) {
                e.stopPropagation();
                var search_data = $(this).val().trim().toLowerCase();

                if (e.keyCode === 13) {
                    e.preventDefault();
                    this.value = null;
                    if (search_data) {
                        //-- 判断用户输入的搜索条件
                        var url;
                        if (commonFun.isURL(search_data)) {
                            if (!(/(https|http|ftp|rtsp|mms):\/\//.test(search_data))) {
                                search_data = 'http://' + search_data;
                            }
                            url = search_data
                        } else {
                            url = "https://www.google.com/search?sourceid=chrome&ie=UTF-8&q=" + search_data;
                        }
                        $("#s_search_input").blur();
                        window.location.replace(url);
                    }
                }
                if (e.keyCode == 147 || e.keyCode == 219 || e.keyCode == 27 || e.keyCode == 8) {
                    e.preventDefault();
                    $(this).blur();
                    SN.focus("#s_search_button")
                    window.history.go(-1)
                }
                //-- up
                if (e.keyCode == 38) {
                    $(this).blur();
                    SN.focus("#s_search_button")
                }
                //-- down
                if (e.keyCode == 40) {
                    $(this).blur();
                    SN.focus('s_history')
                }
                //-- left
                if (e.keyCode == 37) {
                    $(this).blur();
                    SN.focus("#s_search_button")
                }
                //-- right
                if (e.keyCode == 39) {
                    $(this).blur();
                    SN.focus("#s_search_button")
                }
            })
    }
    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#searchpage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#searchpage_container .focusable')
            .off("sn:enter-down")
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#searchpage_container .focusable')
            .off("sn:enter-click")
            .on('sn:enter-click', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
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
        onInputEvent();
        onClickEvent();
    }
    return { render: render, addEvent: addEvent }
})