define(['jquery', 'navigation', 'text!view/bookmarkpageView.html', 'i18n!../nls/language', 'unity/commonFun', 'anm', 'css!style/settingpage.css', 'animation'], function($, SN, bookmarkpageView, language, Fun) {
    'use strict';
    //-- 装载 bookmarkpage模块
    if (window.sraf) {
        window.sraf.addEventListener("getAllBookmarks", getAllBookmarksByLinux);
    }
    //-- Linux 平台接收数据
    function getAllBookmarksByLinux(e) {
        if (e.result != 0) return;
        var data = e.data.slice(0, 20);
        hash_map.get("b_bookmark").initElement(data);
    }

    function getBookmark() {
        if (window.sraf) {
            window.sraf.storage.getAllBookmarks();
        }
        if (window.jsUtil) {
            var data = jsUtil.getBookmarkAll();
            data = JSON.parse(data);
            if (data) {
                data.slice(0, 20);
                hash_map.get("b_bookmark").initElement(data);
            }
        }
    }

    function bookmarkUp(dom) {
        var url = $(dom).attr('url');
        if (window.sraf) {
            window.sraf.storage.moveBookmark(url, 1)
        }
        if (window.jsUtil) {
            window.jsUtil.setBookmarkUp(url)
        }
    }

    function bookmarkDown(dom) {
        var url = $(dom).attr('url');
        if (window.sraf) {
            window.sraf.storage.moveBookmark(url, -1)
        }
        if (window.jsUtil) {
            window.jsUtil.setBookmarkDown(url)
        }
    }

    function bookmarkDelete(dom) {
        var url = $(dom).attr('url');
        var androidId = $(dom).attr('androidId');
        if (window.sraf) {
            var url = $(dom).attr('url');
            window.sraf.storage.deleteBookmark(url)
        }
        if (window.jsUtil) {
            var androidId = $(dom).attr('androidId');
            window.jsUtil.deleteBookmarkById(parseInt(androidId))
        }
    }

    function bookmarkEdit(dom, title) {
        if (window.sraf) {
            var url = $(dom).attr('url');
            window.sraf.storage.updateBookmark(url, title)
        }
        if (window.jsUtil) {
            var androidId = $(dom).attr('androidId');
            window.jsUtil.updateCollection(parseInt(androidId), title)
        }
    }

    function deleteAllBookmark() {
        if (window.sraf) {
            window.sraf.storage.deleteAllBookmarks();
        }
        if (window.jsUtil) {
            window.jsUtil.clearBookmark()
        }
    }
    var hash_map = new Map();
    hash_map.set('b_bookmark', new bookmarkFocusEvent())
    hash_map.set('b_clear', new clearFocusEvent())
    hash_map.set('b_dialog', new dialogFocusEvent())

    function dialogFocusEvent() {
        this.editElem;
        this.initFocus = function(elem) {
            var editElem = $(elem).parent().children(':first-child');
            this.editElem = editElem;
            var title = $(editElem).attr("title")

            this.showEditElement();

            SN.add({
                id: 'b_dialog',
                selector: '#b_bookmark_dialog .focusable',
                straightOnly: true,
                restrict: 'self-only',
                defaultElement: '#b_bookmark_dialog .focusable'
            });
            SN.makeFocusable();

            $("#b_edit_input").val(title);
            $("#b_edit_input").focus();

            $("#b_edit_input")
                .off("keydown")
                .on("keydown", function(e) {
                    e.stopPropagation();
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        $(this).blur();
                        hash_map.get("b_dialog").bookmarkEditSave();
                        return false;
                    }
                    if (e.keyCode == 147 || e.keyCode == 219 || e.keyCode == 27 || e.keyCode == 8) {
                        e.preventDefault();
                        $(this).blur();
                        hash_map.get("b_dialog").hiddenEditElement();
                        return false;
                    }
                    //-- up
                    if (e.keyCode == 38) {
                        $(this).blur();
                        SN.focus("b_dialog")
                    }
                    //-- down
                    if (e.keyCode == 40) {
                        $(this).blur();
                        SN.focus("b_dialog")
                    }
                    //-- left
                    if (e.keyCode == 37) {
                        $(this).blur();
                        SN.focus("b_dialog")
                    }
                    //-- right
                    if (e.keyCode == 39) {
                        $(this).blur();
                        SN.focus($(this).parent().next())
                    }
                })
        }
        this.showEditElement = function() {
            var $dialog = $("#b_bookmark_dialog");
            $dialog.removeClass("display-none");
            setTimeout(function() {
                $(".dialog-content").css('transform', "translate(-50%,-50%) scale(1,1)");
                $(".dialog-content").css('opacity', "0.8");
            })
        }
        this.hiddenEditElement = function() {
            $(".dialog-content").css('transform', "translate(-50%,-50%) scale(0,0)");
            $(".dialog-content").css('opacity', "0");

            //-- 移除页面监听
            $("#b_edit_input").off("keydown")

            setTimeout(function() {
                var $dialog = $("#b_bookmark_dialog");
                $dialog.addClass("display-none");
                SN.focus("b_bookmark");
            }, 400)
        }
        this.back = function() {
            this.hiddenEditElement();
        }
        this.focusClick = function(elem) {
            if ($(elem).hasClass('b-bookmark-input')) {
                $("#b_edit_input").focus();
            }
            if ($(elem).hasClass("dialog-save")) {
                this.bookmarkEditSave()
                this.hiddenEditElement();
            }
            if ($(elem).hasClass("dialog-cancel")) {
                this.hiddenEditElement();
            }
        }
        this.bookmarkEditSave = function() {
            var value = $("#b_edit_input").val().trim();
            if (value) {
                $(this.editElem).children().eq(1).html(value);
                $(this.editElem).attr('title', value);
                bookmarkEdit(this.editElem, value)
            }
            hash_map.get("b_dialog").hiddenEditElement();
            $("#b_edit_input").val(null);
            return;
        }
    }

    function bookmarkFocusEvent() {
        this.initFocus = function() {
            SN.add({
                id: 'b_bookmark',
                selector: '#b_bookmark .focusable',
                enterTo: 'last-focused',
                straightOnly: true,
                defaultElement: '#b_bookmark .focusbale:first'
            });

            // 焦点切换显示和隐藏删除按钮 以及 动画
            $('#b_bookmark .focusable')
                .off("sn:willfocus")
                .on('sn:willfocus', function() {
                    SN.pause();
                    $(this).ensureVertical(function() {
                        SN.focus(this);
                        SN.resume();
                    });
                    //--切换 显示 和 隐藏 状态
                    $(".b-bookmark-list-container")
                        .children()
                        .removeClass('transform-focus')

                    $(this).parent().addClass("transform-focus");
                    return false;
                })
            addEvent();
        }
        this.initElement = function(data) {
            //-- 填充bookmark 栏数据
            var html = '';
            for (var i = 0; i < data.length; i++) {
                //-- 去除https 或者 http
                var url = data[i]['url'].replace(/(http|https):\/\//g, '').replace(/www\./, '');
                //-- 截取域名和域名首字母
                var domain = url.split("/")[0];
                var domainArr = domain.split(".");
                var le = domainArr.length > 2 ? domainArr[1] : domainArr[0];
                var begins = le.substr(0, 1).toUpperCase();

                html += '<div class="b-bookmark-item row-between">'
                html += '<div class="b-bookmark-li row-start focusable" title="' + data[i]["title"] + '" androidId="' + data[i]['id'] + '" url="' + data[i]["url"] + '">'
                html += '<div>' + begins + '</div><div>' + data[i]["title"] + '</div><div>' + domain + '</div>'
                html += '</div>'
                html += '<div class="b-bookmark-button row-center focusable edit"><img src="app/image/common/edit.webp"/></div>'
                html += '<div class="b-bookmark-button row-center focusable up"><img src="app/image/common/up.webp"/></div>'
                html += '<div class="b-bookmark-button row-center focusable down"><img src="app/image/common/down.webp"/></div>'
                html += '<div class="b-bookmark-button row-center focusable delete"><img src="app/image/common/delete.webp"/></div>'
                html += '</div>';
            }
            var bookmark_list = document.getElementById('b_bookmark');
            bookmark_list.innerHTML = html;
            //-- 初始化焦点
            this.initFocus();
        }
        this.back = function() {
            window.history.go(-1);
        }
        this.focusClick = function(elem) {
            try {
                if ($(elem).hasClass("b-bookmark-li")) {
                    //-- 跳转
                    var url = $(elem).attr("url");
                    Fun.locationPush(url);
                }
                if ($(elem).hasClass("edit")) {
                    //-- 编辑标题
                    hash_map.get("b_dialog").initFocus(elem)
                }
                if ($(elem).hasClass("up")) {
                    //-- 向上移动位置
                    var n = $(elem).parent().prev();
                    if (n.length < 1) return;
                    $(elem).parent().insertBefore(n);
                    SN.focus($(elem))
                        //-- 对接底层接口
                    bookmarkUp($(elem).parent().children(':first-child'));
                }
                if ($(elem).hasClass("down")) {
                    //-- 向下移动位置
                    var n = $(elem).parent().next();
                    if (n.length < 1) return;
                    $(elem).parent().insertAfter(n);
                    SN.focus($(elem))
                        //-- 对接底层接口
                    bookmarkDown($(elem).parent().children(':first-child'));
                }
                if ($(elem).hasClass("delete")) {
                    var nextElem, $itemElem;
                    $itemElem = $(elem).parent();
                    if ($itemElem.next().length > 0) {
                        //-- 向下删除
                        nextElem = $itemElem.next().children(':last-child');
                    } else if ($itemElem.prev().length > 0) {
                        //-- 向上删除
                        nextElem = $itemElem.prev().children(':last-child');
                    } else {
                        //-- 删完了
                        nextElem = $("#b_clear .focusable");
                    }
                    //-- 对接终端数据
                    bookmarkDelete($itemElem.find('.b-bookmark-li'));
                    SN.focus(nextElem);

                    setTimeout(function() {
                        $itemElem.remove();
                    })
                }
            } catch (e) {
                console.log(e);
            }
        }
    }

    function clearFocusEvent() {
        this.back = function() {
            window.history.go(-1);
        }
        this.focusClick = function() {
            try {
                SN.pause();
                new Msg({
                    content: language['bookmark-clear'] + '?',
                    confirm: function() {
                        //-- 对接接口
                        try {
                            deleteAllBookmark();
                            document.getElementById("b_bookmark").innerHTML = null;
                            setTimeout(function() {
                                SN.focus("b_clear")
                                SN.resume();
                            })
                        } catch (e) {
                            console.log(e);
                            return;
                        }
                    },
                    cancle: function() {
                        setTimeout(function() {
                            SN.focus("b_clear")
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
        //console.log('bookmarkpage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = bookmarkpageView;
        var bookmarkpage_dom = temp_node.firstElementChild;
        if (!document.getElementById("bookmarkpage_container")) {
            document.getElementById("container").appendChild(bookmarkpage_dom);
        }

        //-- linux 平台由于不能自动弹出键盘，做兼容处理，每次自动获取焦点
        if (window.sraf) {
            //-- 兼容少数国家页面翻转
            if ($('#container').attr('dir') == 'rtl') {
                $(".dialog-save").attr('data-sn-right', '#b_edit_input');
            } else {
                $(".dialog-save").attr('data-sn-left', '#b_edit_input');
            }
        }
    }
    //-- 填充数据
    function fillData() {
        //-- 填充title栏数据
        document.getElementById("b_title").innerHTML = language['bookmark-title'];
        document.getElementById("b_bookmark_clear_title").innerHTML = language['bookmark-clear']
    }

    //-- 初始化页面焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'b_clear',
                selector: '#b_clear .focusable',
                straightOnly: true,
                enterTo: 'last-focused'
            });

            $('#b_clear .focusable')
                .off("sn:willfocus")
                .on('sn:willfocus', function() {
                    //--切换 显示 和 隐藏 状态
                    $(".b-bookmark-list-container")
                        .children()
                        .removeClass('transform-focus')
                })

            SN.makeFocusable();
            SN.focus();
        })
    }

    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#bookmarkpage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#bookmarkpage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的 click 监听
    function onClickEvent() {
        $('#bookmarkpage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function() {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }
    //-- 添加全局的滚轮事件
    function onMousewheel() {
        $('#bookmarkpage_container')
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
            getBookmark();
        } else {
            //-- 测试
            var data = [{ url: 'https://www.cn.baidu.com1', title: '1', id: "1" }, { url: 'www.baidu.com2', title: 'baidu', id: "2" },
                { url: 'https://baidu3.com1', title: 'baidu', id: "3" }, { url: 'www.baidu.com4', title: 'baidu', id: "4" }, { url: 'www.baidu.com5', title: 'baidu', id: "5" },
                { url: 'www.baidu.com6', title: 'baidu', id: "6" }, { url: 'www.baidu.com7', title: 'baidu', id: "7" }, { url: 'www.baidu.com8', title: 'baidu', id: "8" },
                { url: 'www.baidu.com9', title: 'baidu', id: "9" }
            ];
            hash_map.get("b_bookmark").initElement(data);
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