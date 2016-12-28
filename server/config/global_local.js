const configure = {
    // 是否是测试环境
    dev: true,
    // 暴露给用户的主机名，包含端口号
    host: 'http://localhost:29862',
    // 端口号。服务器端需要用nginx转发到该端口。可能与nginx的端口号不一致
    port: 29862,
    // 是否允许注册测试账号
    enable_test_account: true,
    // 日志重定向
    log4js_configure: {
        // 把日志输出到控制台，同时增加文件行号等信息
        appenders: [
            {
                type: 'console',
                category: 'console',
                layout: {
                    type: 'pattern',
                    pattern: '%[[%d{ISO8601}] [%p] [%x{ln}] -%]\t%m',
                    tokens: {
                        ln: logTokensFunc
                    }
                }
            }
        ],
        replaceConsole: true
    },
    // 是否缓存模板文件编译结果
    enable_cache_complied_template: false,
    mongo_db_address: 'mongodb://localhost:25916/meetin_web_db',
};

// 日志打印文件和行号
function logTokensFunc() {
    const codePos = gGetCodePosition(10);
    return `${codePos.file}:${codePos.line} ${codePos.method}`;
}

module.exports = configure;
