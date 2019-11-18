require.config({
    baseUrl:'./',
    // urlArgs: "bust=" +  (new Date()).getTime(),
    paths: {
        "style":"./app/style",
        "model":"./app/model",
        "view":"./app/view",
        "page":"./app/page",
        "js" : "./app/js",
        "nls" : "./app/nls",
        "text":"./lib/require-text",
        "css":"./lib/require-css",
        "i18n":"./lib/i18n",
    }
});
//-- 判断是否是用户首次使用（需要渲染引导页）
var is_first = document.querySelector('meta[name="first"]').getAttribute('content');
if( is_first === '1'){
    // console.log("本次是首次启动,加载 setting 模块---------->");
    require(['page/setupPage'], function (setupPage){
        
    });
}else{
    // console.log("本次是二次启动,加载 homepage 页面---------->");
    require(['page/homePage'],function(homePage){
        homePage.loadModule();
        setTimeout(function(){
            var pending_dom = document.getElementById("ob_pending");
            if(pending_dom) pending_dom.parentNode.removeChild(pending_dom);
        },1000)
    },function(error){
        console.log(error);
    })
}