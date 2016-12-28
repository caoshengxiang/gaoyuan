/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const px2rem = require('postcss-px2rem');
const globalConfig = require('../server/config/global');

exports.makeConfig = function makeConfig(envConfig) {
    console.log('加载webpack配置文件', envConfig)

    const finalConfig = {};
    if (envConfig.entry) {
        finalConfig.entry = envConfig.entry;
    } else {
        finalConfig.entry = {
            build: [
                ...envConfig.injectJs,
                // 'babel-polyfill',
                path.join(envConfig.srcPath, 'main.js'),
            ],
        };
    }
    finalConfig.output = {
        path: envConfig.dstPath,
        chunkFilename: `[id]${envConfig.useHashName ? '-[chunkhash:8]' : ''}.js`,
        publicPath: envConfig.publicPath,
        filename: `[name]${envConfig.useHashName ? '-[chunkhash:8]' : ''}.js`
    };
    finalConfig.module = {
        rules: [
            ...envConfig.prependRules,
            {test: /\.vue$/, loader: 'vue-loader'},
            {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
            // 只对require方式引入的css起作用。不支持自动加前缀，怎么都搞不出来。。
            {test: /\.(css|scss|sass)$/, loader: 'vue-style-loader!css-loader?sourceMap!sass-loader'},
            {test: /\.(png|jpe?g|gif|svg)$/, loader: 'url-loader', options: {limit: 100, name: '[name]-[hash:8].[ext]'}},
            {test: /\.(woff2?|eot|ttf|otf)$/, loader: 'url-loader', options: {limit: 8192, name: '[name]-[hash:8].[ext]'}},
            // shim配置示例。这里导出test.js文件中定义的全局变量testObj，test.js文件内容：var testObj = {name:'test'};
            // 文档 http://webpack.github.io/docs/shimming-modules.html#exporting
            // {test: require.resolve(envConfig.srcPath+"/utils/test.js"), loader: "exports-loader?testObj"}
        ]
    };
    finalConfig.resolve = {
        extensions: ['.js', '.vue'],
        // fallback: [path.join(globalConfig.project_dir, './node_modules')],
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'lodash': 'lodash/lodash.min.js',
            'vue-router': envConfig.isDevelop ? 'vue-router/dist/vue-router' : 'vue-router/dist/vue-router.min',
            'jquery': envConfig.isDevelop ? 'jquery/dist/jquery' : 'jquery/dist/jquery.min',
            'underscore': envConfig.isDevelop ? 'underscore/underscore' : 'underscore/underscore-min',
            'babel-polyfill': envConfig.isDevelop ? 'babel-polyfill/dist/polyfill' : 'babel-polyfill/dist/polyfill.min',
            'entry_src': envConfig.srcPath,
            'common': path.join(globalConfig.project_dir, 'server', 'common'),
        }
    };
    finalConfig.plugins = [
        // http://vue-loader.vuejs.org/en/workflow/production.html
        // 指定编译时的环境变量
        new webpack.DefinePlugin({
            'process.env': {
                // vue.js在正式环境不显示错误提示
                NODE_ENV: envConfig.NODE_ENV
            }
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: envConfig.compress,
            debug: envConfig.isDevelop,
            vue: makeVueConfig(envConfig.extractCss, envConfig.useRem),
        }),
        // Gzip if support can open
        // Added as the last plugin
        // Not sure if it's worth gzipping index.html - no harm no foul
        // var CompressionWebpackPlugin = require('compression-webpack-plugin')
        // new CompressionWebpackPlugin({
        //     assets: "[path].gz[query]",
        //     algorithm: "gzip",
        //     test: /\.js$|\.css$|\.html$/,
        //     threshold: 10240,
        //     minRatio: 0.8
        // }),
    ];
    // 把css抽取出来，可以在html中优先加载
    if (envConfig.extractCss) {
        finalConfig.plugins.push(new ExtractTextPlugin({
            filename: 'main.[contenthash:8].css',
            allChunks: true
        }));
    }
    if (envConfig.htmlDstPath) {
        finalConfig.plugins.push(
            // 向html中注入编译好的js
            // https://github.com/ampedandwired/html-webpack-plugin
            new HtmlWebpackPlugin({
                filename: envConfig.htmlDstPath,
                template: path.join(envConfig.srcPath, 'main.ejs'),
                inject: true,
                favicon: globalConfig.favicon_path,
                // ejs模板参数
                isDevelop: envConfig.isDevelop,
                minify: {
                    // https://github.com/kangax/html-minifier#options-quick-reference
                    removeComments: true,
                    collapseWhitespace: true,
                },
                // chunks: ['build', 'vendor'],   // 要注入的入口js
            })
        )
    }
    finalConfig.plugins = finalConfig.plugins.concat(envConfig.plugins);

    if (!envConfig.isLocal) {
        // 设置map文件格式
        finalConfig.devtool = '#source-map';
        finalConfig.plugins = finalConfig.plugins.concat([
            // 混淆、压缩js
            new webpack.optimize.UglifyJsPlugin({
                compress: envConfig.compress && {
                    warnings: false,
                    drop_debugger: true,
                    // drop_console: true
                },
                sourceMap: envConfig.isDevelop
            }),
            // 抽离公共js。可利用浏览器缓存加速页面载入，版本更新时用户也不需要重新加载公共js文件
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: function minChunks(module) {
                    // 把所有用到的node_modules中的库都提取出来
                    return module.resource && module.resource.endsWith('.js') && (module.resource.startsWith(path.join(globalConfig.project_dir, 'node_modules')) || module.resource.startsWith(path.join(envConfig.srcPath, 'libs')));
                }
            }),
            // 提取公共库配置文件，否则每次build改变后vendor的hash也会改变
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                chunks: ['vendor']
            }),
        ])
    }
    return finalConfig;
}

/**
 * 创建vue用的配置参数
 * @param {boolean} extractCss 是否把css抽取出来
 * @param {boolean} useRem 是否引入把px替换为rem的插件
 * @returns {object}
 */
function makeVueConfig(extractCss, useRem) {
    const config = {
        // 给vue内嵌css加前缀
        postcss: [
            autoprefixer({
                browsers: ['safari >= 5', 'ie >= 8', 'opera >= 12.1', 'ios >= 6', 'android >= 4', 'Chrome >= 42']
            })
        ],
        // 去掉html标签之间的空格，解决行内元素之间换行导致出现空格的问题
        preserveWhitespace: false,
    };
    // 把css抽取出来，可以在html中优先加载
    if (extractCss) {
        config.loaders = {sass: ExtractTextPlugin.extract({fallbackLoader: 'vue-style-loader', loader: 'css-loader!sass-loader'})}
    }
    // 自动把px转换为rem
    if (useRem) {
        config.postcss.push(px2rem({remUnit: 75, remPrecision: 6, baseDpr: 1}))
    }
    return config;
}
