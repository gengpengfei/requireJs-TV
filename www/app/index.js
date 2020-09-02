require.config({
    "baseUrl": "app/lib",
    "urlArgs": "bust=0.0.12",
    "paths": {
        "text": "require-text",
        "i18n": "i18n",
        "css": "require-css/css",
        "view": "../view",
        "style": "../style",
        "js": "../js",
        "unity": "../unity",
        "plugin": "../plugin",
        "nls": "../nls"
    }
});

require(['unity/historyRouter'], function(historyRouter) {
    historyRouter.init();
    if (0) {
        document.getElementById("container").setAttribute("dir", "rtl")
    }
    //-- 跳转到导入兴趣书签页
    if (appType != 3 && bookmarkType == 1) {
        historyRouter.replace('/selbookmark');
        return;
    }
    //-- 由于linux 回退时，不会重新load主页 ，导致在有开屏动画时，回退主页会重新加载开屏动画
    if ((appType == 1 || appType == 2) && !window.jsUtil) {
        historyRouter.replace('/');
        return;
    }
    historyRouter.loadModule();
})