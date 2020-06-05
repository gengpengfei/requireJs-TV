define(['text!view/securitypageView.html','unity/keyDownEvent','i18n!../nls/language'],function(securitypageView,keyDownEvent,language) {
    'use strict';
    if (window.sraf) {
        window.sraf.addEventListener("getSiteBlockDomain", getSiteBlockByLinux);
    }
    function getAdsData(){
        if(window.sraf){
            window.sraf.storage.getSiteblockDomain(2);
        }
    }

    function getWebpageData(){
        if(window.sraf){
            window.sraf.storage.getSiteblockDomain(1);
        }
        if(window.jsUtil){
            var data = window.jsUtil.querySiteBlockDomains();
            fillWebpage(JSON.parse(data));
        }
    }
    function getSiteBlockByLinux(e){
        if(e.blocktype == 1){
            fillWebpage(e.siteblockdomain);
        }
        if(e.blocktype == 2){
            fillAds(e.siteblockdomain);
        }
    }
    function webpageDelecte(dom){
        var url = dom.getAttribute('url');
        if(window.sraf){
            window.sraf.storage.deleteSiteblockByDomain(url,1)
        }
        if(window.jsUtil){
            jsUtil.deleteSiteBlockDomain(url)
        }
    }
    function adsDelecte(dom){
        if(window.sraf){
            var url = dom.getAttribute('url');
            window.sraf.storage.deleteSiteblockByDomain(url,2)
        }
    }
    //-- 首页初始化布局
    function initHtml (){
        //console.log('securitypage - 初始化页面布局-------->');
        var temp_node = document.createElement('div');
        temp_node.innerHTML = securitypageView;
        var securitypage_dom = temp_node.firstChild;
        if(!document.getElementById("securitypage_container")){
            document.getElementById("container").appendChild(securitypage_dom);
        }
    }
    //-- 填充文字
    function fillTitle(){
        document.getElementById("sec_title").innerHTML = language['Security'];
        //-- 填充说明
        document.getElementById("sec_ads_title").innerHTML = language["Disable Ads"]
        document.getElementById("sec_webpage_title").innerHTML = language['Disable Webpage'];
        document.getElementById("sec_security_ads_title").innerHTML = language['Disable Ads'] + ' ( 0 )';
        document.getElementById("sec_security_webpage_title").innerHTML = language['Disable Webpage'] + ' ( 0 )';
    }
    //-- 填充数据
    function fillWebpage(webpageData) {
        //-- 更新数量
        if(webpageData.length > 0) document.getElementById("sec_security_webpage_title").innerHTML = language['Disable Webpage'] + ' ( '+webpageData.length+' )';
        //-- 填充security webpaeg栏数据
        var webpageHtml = '';
        for(var i=0;i<webpageData.length;i++){
            //-- 去除https 或者 http
            var domain =  webpageData[i]['domain'];
            webpageHtml += '<div class="sec-security-item row-start"><div class="sec-security-li row-start"><div>'+domain+'</div></div><div class="sec-security-del row-center" url="'+domain+'" name="sec_focus" id="sec_webpage_'+1+'_'+(i+1)+'"><img src="image/common/delete.webp"></div></div>';
        }
        var security_list = document.getElementById('sec_webpage_list');
        security_list.innerHTML = webpageHtml;       
    }

    function fillAds(adsData){
        if(adsData.length > 0) document.getElementById("sec_security_ads_title").innerHTML = language['Disable Ads'] + ' ( '+adsData.length+' )';
        //-- 填充security ads栏数据
        var adsHtml = '';
        for(var i=0;i<adsData.length;i++){
            //-- 去除https 或者 http
            var domain =  adsData[i]['domain'];
            adsHtml += '<div class="sec-security-item row-start"><div class="sec-security-li row-start"  ><div>'+domain+'</div></div><div class="sec-security-del row-center" url="'+domain+'" name="sec_focus" id="sec_ads_'+1+'_'+(i+1)+'"><img src="image/common/delete.webp"></div></div>';
        }
        var security_list = document.getElementById('sec_ads_list');
        security_list.innerHTML = adsHtml;
    }

    function onclickEvent (){
        //console.log('securitypage - 开启鼠标点击监听-------->');
        //-- 判断当前显示页面
        var securitypage_dom = document.getElementById('securitypage_container');
        var focus_doms = securitypage_dom.querySelectorAll('[name="sec_focus"]');
        for(var i=0;i<focus_doms.length;i++){
            focus_doms[i].onclick = function(e){
                var focus_id = e.target.id.split('_');
                if(focus_id[0] !== 'sec') return false;
                var position = focus_id[0]+'_'+focus_id[1];
                var point_x = parseInt(focus_id[2],10);
                var point_y = parseInt(focus_id[3],10);
                s_hash_map.get(position).focusClick(point_x,point_y);
            }
        }
    }

    
    var s_hash_map = new Map();
    s_hash_map.set('sec_security',new securityFocusEvent())
    s_hash_map.set('sec_ads',new adsFocusEvent())
    s_hash_map.set('sec_webpage',new webpageFocusEvent())

    function webpageFocusEvent(){
        this.prefix = 'sec_webpage';
        this.offset = 0;
        this.initFocus = function(){
            this.addFocus(1,1);
        }
        this.focusUp = function (point_x,point_y){
            try{
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if(!dom.parentNode.previousElementSibling) return;
                this.removeFocus();
                var new_point = dom.parentNode.previousElementSibling.lastChild.getAttribute('id');
                var new_point_y = new_point.split('_')[3];
                this.securityOffset(point_x,new_point_y);
                s_hash_map.get(this.prefix).addFocus(point_x,new_point_y); 
            }catch(e){
                // console.log(e);
            }
        }

        this.focusDown = function(point_x,point_y){
            //-- 判断当前焦点下方的item
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if(!dom.parentNode.nextElementSibling) return;
            var new_point = dom.parentNode.nextElementSibling.lastChild.getAttribute('id');
            var new_point_y = new_point.split('_')[3];
            this.securityOffset(point_x,new_point_y);
            this.removeFocus();
            s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
        }
        this.focusLeft = function(point_x,point_y){

        }

        this.focusRight = function(point_x,point_y){

        }
        this.back = function(){
            s_hash_map.get('sec_webpage').hiddenPage();
            s_hash_map.get('sec_security').addFocus(1,2)
        }
        this.focusClick = function(point_x,point_y){
            try{
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if(dom.parentNode.nextElementSibling){
                    //-- 向下删除
                    //-- 判断当前焦点下方的item
                    var new_point = dom.parentNode.nextElementSibling.lastChild.getAttribute('id');
                    var new_point_y = new_point.split('_')[3];
                    this.removeFocus();
                    s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
                }else if(dom.parentNode.previousElementSibling){
                    //-- 向上删除
                    var new_point = dom.parentNode.previousElementSibling.lastChild.getAttribute('id');
                    var new_point_y = new_point.split('_')[3];
                    //-- 删除时需要同时改变偏移量
                    if(this.offset > 0){
                        this.offsetType('up');
                    }
                    this.removeFocus();
                    s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
                }else{
                    this.back();
                }
                //-- 底层接口对接
                var dom = document.getElementById(this.prefix + '_1_' + point_y);
                webpageDelecte(dom);
                //-- 删除当前条
                dom.parentNode.parentNode.removeChild(dom.parentNode);
                    //-- 更新数字显示
                    var num = document.getElementById("sec_webpage_list").childNodes.length
                    document.getElementById("sec_security_webpage_title").innerHTML = language['Disable Webpage'] + ' ( '+num+' )';
            }catch(e){
                //console.log(e);
            }
        }
        this.securityOffset = function(point_x,point_y){
            var child = document.getElementById(this.prefix + '_' + point_x + '_' + point_y).parentNode
            var i = 0;
            while((child = child.previousElementSibling) != null) i++;
            if(i - this.offset > 9){
                this.offsetType('down');
            }
            if(i-this.offset < 0){
                this.offsetType('up');
            }
        }
        this.offsetType = function(type){
            if(type === 'down'){
                this.offset += 1;
            }else if(type === 'up'){
                this.offset -= 1;
            }else{
                return false;
            }
            //-- 计算偏移
            var security_offset = '-' + this.offset*6.9 + 'vh';
            var security_item = document.getElementById('sec_webpage_list');
            security_item.style.webkitTransform = "translateY("+security_offset+")";
        }
        this.checkFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
        }
        this.addFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if(dom){
                dom.classList.add('active');
                //-- 同时添加父元素类名
                dom.parentNode.classList.add('transform-focus');
            }
        }
        this.removeFocus = function(){
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if(dom){
                dom.classList.remove('active');
                //-- 同时移除父元素类名
                dom.parentNode.classList.remove('transform-focus');
            }
        }
        this.isShow = function(){
            var dom = document.getElementById('sec_webpage_container');
            return dom.className.indexOf('show') == -1 ? false:true;
        }
        this.showPage = function(){
            var dom = document.getElementById('sec_webpage_container');
            dom.classList.add("show");
            //-- 判断是否已经初始化焦点
            if(dom.querySelector(".active")) return;
            this.initFocus();
        }
        this.hiddenPage = function(){
            var dom = document.getElementById('sec_webpage_container');
            dom.classList.remove("show");
            var transform = dom.querySelector(".transform-focus");
            if(transform) transform.classList.remove("transform-focus");
            var activeDom = dom.querySelector(".active");
            if(activeDom) activeDom.classList.remove("active");
        }
    }
    function adsFocusEvent(){
        this.prefix = 'sec_ads';
        this.offset = 0;
        this.initFocus = function(){
            this.addFocus(1,1);
        }

        this.focusUp = function (point_x,point_y){
            try{
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if(!dom.parentNode.previousElementSibling) return;
                this.removeFocus();
                var new_point = dom.parentNode.previousElementSibling.lastChild.getAttribute('id');
                var new_point_y = new_point.split('_')[3];
                this.securityOffset(point_x,new_point_y);
                s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
            }catch(e){
                // console.log(e);
            }
        }

        this.focusDown = function(point_x,point_y){
            //-- 判断当前焦点下方的item
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if(!dom.parentNode.nextElementSibling) return;
            var new_point = dom.parentNode.nextElementSibling.lastChild.getAttribute('id');
            var new_point_y = new_point.split('_')[3];
            this.securityOffset(point_x,new_point_y);
            this.removeFocus();
            s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
        }
        this.focusLeft = function(point_x,point_y){
            // var new_point_x = point_x - 1;
            // if(!this.checkFocus(new_point_x,point_y)) return ;
            // this.removeFocus();
            // this.addFocus(new_point_x,point_y);
        }

        this.focusRight = function(point_x,point_y){
            // var new_point_x = point_x + 1;
            // if(!this.checkFocus(new_point_x,point_y)) return ;             
            // this.removeFocus();
            // this.addFocus(new_point_x,point_y);
        }
        this.back = function(){
            s_hash_map.get('sec_ads').hiddenPage();
            s_hash_map.get('sec_security').addFocus(1,1)
        }
        this.focusClick = function(point_x,point_y){
            try{
                var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
                if(dom.parentNode.nextElementSibling){
                    //-- 向下删除
                    //-- 判断当前焦点下方的item
                    var new_point = dom.parentNode.nextElementSibling.lastChild.getAttribute('id');
                    var new_point_y = new_point.split('_')[3];
                    this.removeFocus();
                    s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
                }else if(dom.parentNode.previousElementSibling){
                    //-- 向上删除
                    var new_point = dom.parentNode.previousElementSibling.lastChild.getAttribute('id');
                    var new_point_y = new_point.split('_')[3];
                    //-- 删除时需要同时改变偏移量
                    if(this.offset > 0){
                        this.offsetType('up');
                    }
                    this.removeFocus();
                    s_hash_map.get(this.prefix).addFocus(point_x,new_point_y);
                }else{
                    this.back();
                }
                
                //-- 底层接口对接
                var dom = document.getElementById(this.prefix + '_1_' + point_y);
                adsDelecte(dom);

                //-- 删除当前条
                dom.parentNode.parentNode.removeChild(dom.parentNode);
                //-- 更新数字显示
                var num = document.getElementById("sec_ads_list").childNodes.length
                document.getElementById("sec_security_ads_title").innerHTML = language['Disable Ads'] + ' ( '+num+' )';

            }catch(e){
                // console.log(e);
            }
        }
        this.securityOffset = function(point_x,point_y){
            var child = document.getElementById(this.prefix + '_' + point_x + '_' + point_y).parentNode
            var i = 0;
            while((child = child.previousElementSibling) != null) i++;
            if(i - this.offset > 9){
                this.offsetType('down');
            }
            if(i-this.offset < 0){
                this.offsetType('up');
            }
        }
        this.offsetType = function(type){
            if(type === 'down'){
                this.offset += 1;
            }else if(type === 'up'){
                this.offset -= 1;
            }else{
                return false;
            }
            //-- 计算偏移
            var security_offset = '-' + this.offset*6.9 + 'vh';
            var security_item = document.getElementById('sec_ads_list');
            security_item.style.webkitTransform = "translateY("+security_offset+")";
        }
        this.checkFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
        }
        this.addFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            if(dom){
                dom.classList.add('active');
                //-- 同时添加父元素类名
                dom.parentNode.classList.add('transform-focus');
            }
        }
        this.removeFocus = function(){
            var dom = document.getElementById(this.prefix).querySelector(".active");
            if(dom){
                dom.classList.remove('active');
                //-- 同时移除父元素类名
                dom.parentNode.classList.remove('transform-focus');
            }
        }
        this.isShow = function(){
            var dom = document.getElementById('sec_ads_container');
            return dom.className.indexOf('show') == -1 ? false:true;
        }
        this.showPage = function(){
            var dom = document.getElementById('sec_ads_container');
            dom.classList.add("show");
            //-- 判断是否已经初始化焦点
            if(dom.querySelector(".active")) return;
            this.initFocus();
        }
        this.hiddenPage = function(){
            var dom = document.getElementById('sec_ads_container');
            dom.classList.remove("show");
            var transform = dom.querySelector(".transform-focus");
            if(transform) transform.classList.remove("transform-focus");
            var activeDom = dom.querySelector(".active");
            if(activeDom) activeDom.classList.remove("active");
        }
    }

    function securityFocusEvent(){
        this.prefix = 'sec_security';

        this.focusUp = function (point_x,point_y){
            try{
                var new_point_y = point_y - 1;
                if(!this.checkFocus(point_x,new_point_y)) return;
                this.removeFocus();
                this.addFocus(point_x,new_point_y);
            }catch(e){
                // console.log(e);
            }
        }
        this.focusDown = function(point_x,point_y){
            try{
                var new_point_y = point_y + 1;
                if(!this.checkFocus(point_x,new_point_y)) return;
                this.removeFocus();
                this.addFocus(point_x,new_point_y);
            }catch(e){
                // console.log(e);
            }
        }
        this.focusLeft = function(point_x,point_y){}
        this.focusRight = function(point_x,point_y){}
        this.back = function(){
            window.history.go(-1);
        } 
        this.focusClick = function(point_x,point_y){
            try{
                if(point_y == 1){
                    if(document.getElementById("sec_ads_list").hasChildNodes()){
                        s_hash_map.get('sec_ads').showPage();
                        this.removeFocus();
                    }
                }
                if(point_y == 2){
                    if(document.getElementById("sec_webpage_list").hasChildNodes()){
                        s_hash_map.get('sec_webpage').showPage();
                        this.removeFocus();
                    }
                }                
            }catch(e){ 
                //console.log(e);
            }
        }
        this.checkFocus = function(point_x,point_y){
            var dom = document.getElementById(this.prefix + '_' + point_x + '_' + point_y);
            return dom ? true : false;
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
    function onkeydownEvent(){
        var keyDown = keyDownEvent.createNew();
        keyDown.bindKey('sec_security',new securityFocusEvent())
        keyDown.bindKey('sec_ads',new adsFocusEvent())
        keyDown.bindKey('sec_webpage',new webpageFocusEvent())
    }
    function initFocus(){
        if(window.jsUtil){
            var dom = document.getElementById("sec_security_1_1");
            dom.remove();
            s_hash_map.get('sec_security').addFocus(1,2);
        }else{
            s_hash_map.get('sec_security').addFocus(1,1);
        }
    }
    //-- 装载 securitypage模块
    var render = function(){
        initHtml();
        fillTitle();
        if (window.sraf || window.jsUtil) {
            getAdsData();
            getWebpageData();
        }else{
            //-- 测试
            // var webpageData = [
            //     {'domain':'http://www.baidu.com','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.booking.com','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.goole.com','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.bbc.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.lanhuapp.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.fanyi.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'}
            // ];
            // fillWebpage(webpageData);
            // var adsData = [
            //     {'domain':'http://www.baidu.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.booking.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.goole.com/?ad=1','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.baidu.com','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.booking.com','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'},
            //     {'domain':'http://www.goole.com','title':'Title name redmine seraphic-corp Title name redmine seraphic-corp'}
            // ];
            // fillAds(adsData);
        }
        //-- 初始化焦点
        initFocus();
    }
    var bind = function(){
        onkeydownEvent();
    }
    var run = function(){
        onclickEvent();
    }
    return {
        render:render,
        bind:bind,
        run:run
    };
});