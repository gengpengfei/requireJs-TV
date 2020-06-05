({
    //-- 根目录
    baseUrl:'../app',
    //-- 输出目录
    dir: '../build',
    //-- 配置文件
    mainConfigFile: './config.js',
    //-- 编译之前是否保留build目录
    keepBuildDir: false,
    modules: [
        {
            name: 'index',
            create: true,
            include: ['index'],
        },
        {
            name: 'search',
            create: true,
            include: ['search'],
        },
        {
            name: 'setting',
            create: true,
            include: ['setting'],
        }
    ],
    //-- 将模块排除在优化文件之外
    stubModules: [],
    //-- 忽略文件
    fileExclusionRegExp: /(^example)|(.git)|node_modules$/,
    //-- 跳过未指定依赖的组件
    skipDirOptimize: true,
    //-- 优化css
    optimizeCss: "standard",
    //-- 忽略需要优化的css 例：cssImportIgnore:"a.css,b.css"
    cssImportIgnore: null,
    //-- 优化js
    optimize: "uglify",
    uglify: {
        toplevel: true,
        ascii_only: true,
        beautify: true,
        max_line_length: 1000,
        defines: {
          DEBUG: ["name", "false"]
        },
        no_mangle: true
    },
    //-- 处理所有的文本资源依赖项，从而避免为加载资源而产生的大量单独xhr请求
    inlineText: true,
    //-- 是否允许 "user strict"
    userStrict: true,
    //-- 允许requirejs名称空间，使require和define换作新的名字
    // namespace: "foo",
    // 处理级联依赖，默认为false。为true时，级联模块会被一同打包
    findNestedDependencies: false,
    // 是否忽略 CSS 资源文件中的 @import 指令
    cssImportIgnore: null,
    // 若为true，优化器会强制在文件中包裹一层 define(require, exports, module) {})
    cjsTranslate: true,

    // 在每个文件模块被读取时的操作函数，可在函数体内作适当变换
    onBuildRead: function (moduleName, path, contents) {
        return contents;
    },

    // 在每个文件模块被写入时的操作函数
    onBuildWrite: function (moduleName, path, contents) {
        return contents;
    },

    //-- 发生错误时，强制抛出异常
    throwWhen: {
        optimize: true
    },
    // node tools/r.js -o tools/build.js
})