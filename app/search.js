require.config({
    // urlArgs: "bust=" +  (new Date()).getTime(),
    paths: {
        "text":"./lib/require-text",
        "css":"./lib/require-css/css",
        "i18n":"./lib/i18n",
    }
});

//-- 加载样式
require(['css!style/searchpage.css','unity/commonFun','i18n!nls/language']);

require(['unity/hashRouter','unity/keyDownEvent'],function(HashRouter,keyDownEvent) {
    //-- 启用路由监听
    var router = HashRouter.createNew();
    router.createEvent();
    window.location.replace(window.location.href.toString().replace(window.location.hash, '')+"#"+"searchpage")
    router.loadView("searchpage");

    //-- 启用键盘监听
    var keyDown = keyDownEvent.createNew();
    keyDown.addEvent();

    //-- 加载弹出框插件
    require(['plugin/msg/index']);
})
