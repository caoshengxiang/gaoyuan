/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const historyFallback = require('../server/routes/history_api_fallback');
const webpackConfigs = require('./webpack.config.local')
const entryConfigs = require('./webpack_entry')
// 都是一样的，取第一个就行了
const publicPath = webpackConfigs[0].output.publicPath;

exports.useWebpackDevMiddleware = function useWebpackDevMiddleware(app) {
    historyFallback.setHtmlBase(publicPath);

    for (let i = 0; i < webpackConfigs.length; i++) {
        setupWebpackMiddleware(app, webpackConfigs[i], entryConfigs[i].hmrPath)
    }
}

function setupWebpackMiddleware(app, webpackConfig, hmrPath) {
    // 调用webpack并把配置传递过去
    const compiler = webpack(webpackConfig, (err, stats) => {
        if (err) {
            throw err;
        }
        const msg = stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        });
        process.stdout.write(`${msg}\n`)
        console.log('\x1b[34mSPA编译完成\x1b[0m');
    })

    // 将webpack编译结果放在内存中，并监听变化
    app.use(webpackDevMiddleware(compiler, {
        publicPath,
        // 不显示初次编译时的那一坨日志，只显示error（目前失效了）
        noInfo: true,
        // 不显示任何日志
        quiet: true,
    }))

    // 热加载
    app.use(webpackHotMiddleware(compiler, {path: hmrPath}))
}
