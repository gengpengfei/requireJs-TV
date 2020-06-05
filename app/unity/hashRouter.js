define(function() {
    //-- 定义路由类
    var HashRouter = {
        createNew: function(){
            var hashRouter = {};
            hashRouter.createEvent = function(){ 
                console.log('启用路由监听---------');
                var callback = function (e){
                    window.history.replaceState('back', '', '');
                    var hash = this.getHash()
                    this.removeView(hash);
                    this.loadView(hash);
                }.bind(this)
                window.addEventListener("hashchange",callback)
                window.addEventListener('popstate', function(e) {
                    if(e.state == 'back' ) {
                        //-- 当前是返回操作

                    }
                });  
            }
            //-- 获得当前路由
            hashRouter.getHash = function(){
                var hash = location.hash;
                if (hash.indexOf('#') !== -1) {
                    hash = hash.substring(1);
                }else{
                    hash = 'settingpage';
                }
                return hash;
            }
            //-- 路由跳转
            hashRouter.hashPath = function(path){   
                location.hash = path
            }

            //-- 加载页面
            hashRouter.loadView = function(path){
                try{
                    require(['js/'+path],function(module){
                        new Promise(function(resolve,reject){
                            try{
                                module.render();
                                module.bind();
                                resolve('success');
                            }catch(e){
                                console.log(e);
                            }
                        }).then(function(){
                            try{
                                module.run();
                                hashRouter.showView(path);
                            }catch(e){
                                console.log(e);
                            }
                            
                        })
                    });
                }catch(e){
                    console.log(e);
                }
            }

            //-- 显示当前路由对应的页面
            hashRouter.showView = function(path){
                var modules = document.querySelectorAll('[module]');
                for(var i=0; i<modules.length; i++){
                    if(modules[i].classList.contains('module-block')){
                        modules[i].classList.remove('module-block');
                        modules[i].classList.add('module-none');
                    }
                }
                document.querySelector('[module="'+path+'"]').classList.add('module-block')
            }

            //-- 后退移除模块
            hashRouter.removeView = function(path){
                var n_dom = document.querySelector('[module="'+path+'"]');
                if(n_dom && n_dom.nextElementSibling){
                    n_dom.parentNode.removeChild(n_dom.nextElementSibling);
                    this.removeView(path);
                }
                return;
            }
            return hashRouter;
        }
    };
    //-- 返回路由类
    return HashRouter;
});