const path = require('path');
const configMaker = require('./webpack_config_maker');
const globalConfig = require('../server/config/global');
const entryConfig = require('./webpack_entry');

// 正式环境服务器版
module.exports = entryConfig.map((entry) => {
    return ({
        isLocal: false,
        isDevelop: false,
        srcPath: entry.srcPath,
        dstPath: path.join(globalConfig.web_static_dir, 'static', 'assets'),
        publicPath: 'http://oiwmy8uo6.bkt.clouddn.com/static/assets/',
        // 要打包进build.js中的js文件
        injectJs: [],
        // 要在最前面引入的loader规则
        prependRules: [],
        htmlDstPath: path.join(globalConfig.web_static_dir, 'templates', entry.htmlName),
        NODE_ENV: '"production"',
        compress: true,
        // 提取出的各js文件是否使用自己的hash命名。但开启hmr后无法使用此功能
        useHashName: true,
        extractCss: true,
        useRem: entry.useRem,
        plugins: [],
    });
}).map(configMaker.makeConfig);
