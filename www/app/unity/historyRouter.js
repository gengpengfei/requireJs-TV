define(["domReady"], function(domReady) {
    //-- 定义路由类
    var routers = [{
        'path': '/',
        'require': 'homepage'
    }, {
        'path': '/search',
        'require': 'searchpage'
    }, {
        'path': '/settings',
        'require': 'settingpage'
    }, {
        "path": "/history",
        "require": 'historypage'
    }, {
        "path": "/privacy",
        "require": 'privacypage'
    }, {
        "path": "/security",
        "require": 'securitypage'
    }, {
        "path": "/bookmark",
        "require": 'bookmarkpage'
    }, {
        "path": "/about",
        "require": 'aboutpage'
    }, {
        "path": "/selbookmark",
        "require": 'selbookmarkpage'
    }, {
        "path": "/guide",
        "require": 'guidepage'
    }, {
        "path": "/aboutcookies",
        "require": 'aboutcookiespage'
    }, {
        "path": "/aboutterms",
        "require": 'abouttermspage'
    }, {
        "path": "/aboutprivacy",
        "require": 'aboutprivacypage'
    }, {
        "path": "/help",
        "require": 'helppage'
    }];

    function _dispatchEvent(type) {
        var orig = history[type];
        return function() {
            var rv = orig.apply(this, arguments);
            var e = new Event(type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return rv;
        };
    };

    function getRequire(pathname) {
        var rootPath, requirePath;
        for (var i = 0; i < routers.length; i++) {
            if (routers[i].path && pathname === routers[i].path) {
                requirePath = routers[i].require;
                break;
            }
            if (routers[i].path == '/') {
                rootPath = routers[i].require;
            }
        }
        return requirePath ? requirePath : rootPath;
    }

    function loadModule() {
        var pathname = location.pathname;
        var requireFile = getRequire(pathname);
        require(["js/" + requireFile], function(Module) {
            domReady(function() {
                Module.render();

                //-- 控制页面显示
                var _o = document.getElementById("container").querySelector(".module-block")
                _o && _o.classList.remove("module-block");
                var _n = document.getElementById(requireFile + "_container")
                _n && _n.classList.add("module-block")

                Module.addEvent();
            })
        })
    }

    function setLastFocus() {
        var lastFocus = document.activeElement.getAttribute("_uid");
        var path = location.pathname;
        lastFocus && sessionStorage.setItem(path, lastFocus)
    }

    var historyRouter = {
        init: function() {
            window.addEventListener('popstate', function() {
                loadModule();
            });
            // -- 自定义pushState监听事件
            history.pushState = _dispatchEvent('pushState');

            window.addEventListener('pushState', function(e) {
                loadModule();
            });


            history.replaceState = _dispatchEvent('replaceState')

            window.addEventListener('replaceState', function(e) {
                loadModule();
            });
        },
        push: function(path) {
            setLastFocus();
            var query = window.location.search.substring(1);
            var url = path + '?' + query
                //-- 获取当前历史栈
            var _path = location.pathname;
            if (_path.replace(/\//, '') === path.replace(/\//, '')) {
                return false;
            }
            history.pushState({ 'from': path }, '', url);
        },
        replace: function(path) {
            setLastFocus();
            var query = window.location.search.substring(1);
            var url = path + '?' + query
            history.replaceState({ 'from': path }, '', url);
        },
        loadModule: function() {
            loadModule();
        },
        setLastFocus: setLastFocus
    };

    //-- 返回路由类
    return historyRouter;
});