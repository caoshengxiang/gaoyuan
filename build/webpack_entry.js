/**
 * 一些不同的入口需要用不同的配置来编译，webpack自身的多入口机制无法满足的话，就需要在这里配置一套独立的编译流程了
 * Created by lnk on 2016/12/8.
 */
const path = require('path');
const globalConfig = require('../server/config/global');

module.exports = [
    {
        // webpack打包源码目录
        srcPath: path.join(globalConfig.client_src_dir, 'admin_pc'),
        htmlName: 'admin_pc.html',
        // 该入口负责这个路径下的所有url
        historyApiPath: '/',
        hmrPath: '/__webpack_hmr/admin_pc',
        useRem: false,
    },
];
