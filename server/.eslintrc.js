module.exports = {
    // 预定义一些全局变量
    env: {
        'node': true,
        'es6': true,
    },
    parserOptions: {
        // ECMAScript 版本
        'ecmaVersion': 6,
        'sourceType': 'script',
    },
    // 全局变量
    globals: {
        'MError': true,
        'gConfig': true,
        'gWrapPromiseResult': true,
        'gFilterDocument': true,
        'gFilterDocumentForBulk': true,
        'gBulkExecutePromise': true,
        'gGetCodePosition': true,
        'gStringifyUrlParams': true,
    },
    // add your custom rules here
    rules: {
        // 允许不写use strict，不然以后改成模块化还要再删掉
        'strict': 0,
        // require语句下方不用加空行
        'import/newline-after-import': 0,
    },
}
