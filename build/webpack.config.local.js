/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const configMaker = require('./webpack_config_maker');
const entryConfigs = require('./webpack_entry');
const globalConfig = require('../server/config/global');

// 本地express中间件版
module.exports = entryConfigs.map((entry) => {
    return ({
        isLocal: true,
        isDevelop: true,
        srcPath: entry.srcPath,
        dstPath: path.join(globalConfig.web_static_dir, 'static', 'assets'),
        publicPath: '/static/assets/',
        // 要打包进build.js中的js文件
        injectJs: [
            // 浏览器端响应热加载
            // 'eventsource-polyfill',
            `webpack-hot-middleware/client?path=${entry.hmrPath}`,
        ],
        // 要在最前面引入的loader规则
        prependRules: [
            // 编译时对vue和js文件运行eslint
            // {test: /\.(vue|js)$/, loader: 'eslint-loader', enforce: 'pre', exclude: /node_modules/}
        ],
        htmlDstPath: entry.htmlName,
        NODE_ENV: '"develop"',
        compress: false,
        // 提取出的各js文件是否使用自己的hash命名。但开启hmr后无法使用此功能
        useHashName: false,
        // 阻止vue提取css。否则无法热替换vue中内嵌的css
        extractCss: false,
        useRem: entry.useRem,
        plugins: [
            // // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin(),
        ],
    });
}).map(configMaker.makeConfig);
