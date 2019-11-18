({
    //-- 根目录
    baseUrl:'../',
    //-- 配置文件
    mainConfigFile: '../main.js',
    //-- 输出目录
    dir: '../build',
    //-- 编译之前是否删除build目录
    keepBuildDir: true,
    //-- 忽略文件
    // fileExclusionRegExp: /(^example)|(.git)|node_modules$/,
    //-- 优化css
    optimizeCss: "standard",
    //-- 优化js
    optimize: "uglify2",
    uglify2: {
        output: {
            beautify: true
        },
        compress: {
            sequences: false,
            global_defs: {
                DEBUG: false
            }
        },
        warnings: true,
        mangle: false
    },
    //-- 处理所有的文本资源依赖项，从而避免为加载资源而产生的大量单独xhr请求
    inlineText: true,
    modules: [
        {
            name: './app/page/homePage',
        }
    ],
    // node tools/r.js -o tools/build.js
})