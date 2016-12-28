module.exports = {
    // 预定义一些全局变量
    env: {
        'browser': true,
        'es6': true,
    },
    parserOptions: {
        // ECMAScript 版本
        'ecmaVersion': 6,
        'sourceType': 'module',
    },
    // required to lint *.vue files
    plugins: [
        'html'
    ],
    // check if imports actually resolve
    settings: {
        'import/resolver': {
            'webpack': {
                'config': 'build/webpack.config.local.js'
            }
        }
    },
    // 全局变量
    globals: {
        'commonUtils': true,
    },
    // add your custom rules here
    rules: {
        // import时不加后缀名
        'import/extensions': [2, 'always', {
            js: 'never',
            vue: 'never'
        }],
        // 生产环境禁止debugger语句
        // TODO
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    }
}
