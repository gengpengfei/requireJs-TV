define(['jquery', 'navigation', 'text!view/helppageView.html', 'i18n!../nls/language', 'unity/network', 'css!style/settingpage.css', 'animation'], function($, SN, helppageView, language, network) {
    'use strict';
    var state = {
        isRender: false
    }

    function setFeedback(params) {
        var option = {
            url: 'http://18.189.74.252:8082/api/addFeedback',
            type: 'POST',
            dataType: 'json',
            data: params
        }
        network.send(option).then(function(request) {
            console.log(request)
        }).catch(function(e) {
            console.log(e)
        });
    }
    var hash_map = new Map();
    hash_map.set('hel_help', new helpFocusEvent())

    function helpFocusEvent() {
        this.back = function() {
            window.history.go(-1);
        }
        this.focusClick = function(elem) {
            if ($(elem).hasClass("hel-email")) {
                $("#hel_email_input").focus();
            }
            if ($(elem).hasClass("hel-textarea")) {
                $("#hel_textarea_input").focus();
            }
            if ($(elem).hasClass("hel-item-button")) {
                // 提交
                var email_data = $("#hel_email_input").val().trim().toLowerCase();
                var textarea_data = $("#hel_textarea_input").val().trim().toLowerCase();
                if (!email_data) {
                    $("#hel_email_input").focus();
                    return;
                }
                if (!textarea_data) {
                    $("#hel_textarea_input").focus();
                    return;
                }
                $("#hel_email_input").val(null);
                $("#hel_textarea_input").val(null);
                setFeedback({ email: email_data, feedback: textarea_data, pojectName: projectName, projectTag: projectTag, version: appVersion })
            }
        }
    }
    //-- 首页初始化布局
    function initHtml() {
        //console.log('helppage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = helppageView;
        var helppage_dom = temp_node.firstChild;
        if (!document.getElementById("helppage_container")) {
            document.getElementById("container").appendChild(helppage_dom);
            //-- 兼容少数国家页面翻转
            if ($('#container').attr('dir') == 'rtl') {
                $("#hel_email").attr("data-sn-left", null);
                $("#hel_textarea").attr("data-sn-left", null);
                $("#hel_email").attr("data-sn-right", "#hel-item-2");
                $("#hel_textarea").attr("data-sn-right", "#hel-item-2");
            } else {
                $("#hel_email").attr("data-sn-left", "#hel-item-2");
                $("#hel_textarea").attr("data-sn-left", "#hel-item-2");
                $("#hel_email").attr("data-sn-right", null);
                $("#hel_textarea").attr("data-sn-right", null);
            }
        }
    }
    //-- 填充文字
    function fillData() {
        document.getElementById("hel_title").innerHTML = language['help-help'] + ' & ' + language["help-feedback"];
    }
    //-- 初始化页面焦点
    function focusInit() {
        $(document).ready(function() {
            SN.init();
            SN.add({
                id: 'hel_help',
                selector: '#helppage_container .focusable',
                straightOnly: 'true',
                enterTo: 'last-focused'
            });

            $('#helppage_container .focusable')
                .off("sn:willfocus")
                .on('sn:willfocus', function() {
                    var _that = this;
                    if (!$(_that).hasClass("hel-item")) {
                        _that = _that.parentNode.parentNode;
                    }
                    SN.pause();
                    $(_that).ensureHorizontal(function() {
                        SN.focus(this);
                        SN.resume();
                    });

                    //-- 切换page标识位
                    var index = $(".hel-item").index(_that);
                    $(".hel-page-item").removeClass("check").eq(index).addClass("check")
                })

            SN.makeFocusable();
            SN.focus("#helppage_container .focusable:first");

            $("#hel_email_input")
                .off("keydown")
                .on("keydown", function(e) {
                    e.stopPropagation();
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        $("#hel_textarea_input").focus();
                    }
                    if (e.keyCode == 147 || e.keyCode == 219 || e.keyCode == 27 || e.keyCode == 8) {
                        e.preventDefault();
                        $(this).blur();
                        window.history.go(-1)
                    }
                    //-- down
                    if (e.keyCode == 40) {
                        $(this).blur();
                        SN.focus('#hel_textarea')
                    }
                })

            $("#hel_textarea_input")
                .off("keydown")
                .on("keydown", function(e) {
                    e.stopPropagation();
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        $("#hel_submit").focus();
                    }
                    if (e.keyCode == 147 || e.keyCode == 219 || e.keyCode == 27 || e.keyCode == 8) {
                        e.preventDefault();
                        $(this).blur();
                        window.history.go(-1)
                    }
                    //-- down
                    if (e.keyCode == 40) {
                        $(this).blur();
                        SN.focus('#hel_submit')
                    }
                })
        })
    }

    //-- 添加全局 enter 监听
    function onEnterEvent() {
        $('#helppage_container .focusable')
            .off('sn:enter-down')
            .on('sn:enter-down', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }

    //-- 添加全局 click 监听
    function onClickEvent() {
        $('#helppage_container .focusable')
            .off('sn:enter-click')
            .on('sn:enter-click', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).focusClick(this);
            });
    }

    //-- 添加全局 back 监听
    function onBackEvent() {
        $('#helppage_container .focusable')
            .off('sn:enter-back')
            .on('sn:enter-back', function(e) {
                var sectionId = SN.getSectionId(this)
                hash_map.get(sectionId).back(this);
            });
    }
    var render = function() {
        if (state.isRender) return;
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