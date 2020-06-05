require.config({
    paths: {
        "text":"./lib/require-text",
        "i18n":"./lib/i18n",
        "css":"./lib/require-css/css"
    }
});

require(['text!view/homepageView.html','i18n!nls/language','unity/network']);

require(['css!style/homepage.css']);

require(['unity/hashRouter','unity/keyDownEvent'],function(HashRouter,keyDownEvent) {
    //-- 启用路由监听
    var router = HashRouter.createNew();
    router.createEvent();
    window.location.replace(window.location.href.toString().replace(window.location.hash, '')+"#"+"homepage")
    router.loadView("homepage");

    //-- 启用键盘监听
    var keyDown = keyDownEvent.createNew();
    keyDown.addEvent();

    setTimeout(function(){
        var pending_dom = document.getElementById("ob_pending");
        if(pending_dom) pending_dom.parentNode.removeChild(pending_dom);
    },3000)
})
