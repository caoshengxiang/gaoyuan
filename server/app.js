const express = require('express');
const path = require('path');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const log4js = require('log4js');
require('./global');
const historyFallback = require('./routes/history_api_fallback');
const templateRender = require('./routes/render');
const browserInfo = require('./routes/utils/browser_info');
const authenticator = require('./routes/sign/authenticator');
const dbManager = require('./db_utils');
const errorHandler = require('./error_handler');
console.log(`已载入${gConfig.is_server ? '服务器' : '开发机'}${gConfig.dev ? '测试环境' : '正式环境'}配置`);

const app = express();

// 初始化logger
log4js.configure(gConfig.log4js_configure);

// 打印每个请求的处理耗时
app.use(logger('dev'));

console.log('server start...');

// 捕获未处理的异常
process.on('uncaughtException', errorHandler.printUncaughtException);
process.on('unhandledRejection', errorHandler.printUnhandledRejection);
process.on('warning', errorHandler.printProcessWarning);

// 使用数据库储存session
app.use(dbManager.getSessionRouter());

// 初始化模板引擎
templateRender.init(app);

app.use((req, res, next) => {
    // 打印每次请求的路径
    console.log(`${req.method} url: ${req.url}`);

    // 模板引擎中的全局变量
    res.locals = {
        // 暴露给用户的主机名，包含端口号
        host: gConfig.host,
        // 是否是测试环境
        isDevelop: gConfig.dev,
        isAcceptHtml: testAccept(req, ['text/html', '*/*']),
        onlyAcceptJson: testAccept(req, ['application/json']),
    };
    if (res.locals.isAcceptHtml) {
        // 将url中的参数存入query对象。方便通过url开关呈现不同页面状态
        res.locals.query = req.query;
    }
    // response中的全局变量
    // if (req.session.user) {
    //     res.locals.username = req.session.user.username;
    // }

    next();
});
// nginx 默认上传包大小是5mb
// 解析application/json
app.use(bodyParser.json({limit: gConfig.max_request_size}));

// 解析application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    limit: gConfig.max_request_size,
    extended: false
}));
app.use(bodyParser.text({limit: gConfig.max_request_size}));

app.use(cookieParser());

app.use((req, res, next) => {
    // 打印每次POST请求的数据。在这里才能取到body数据
    const bodyLength = req.get('Content-Length') || 0;
    if (req.method !== 'GET' && req.body && (typeof req.body !== 'object' || !isEmptyObject(req.body))) {
        if (bodyLength > 300) {
            console.log(`${req.method} data: length[${bodyLength}]`);
        } else {
            console.log(`${req.method} data: ${JSON.stringify(req.body)}`);
        }
    }

    next();
});

function isEmptyObject(obj) {
    for (const key in obj) {
        // 如果obj是Object.create(null)创建出来的，就没有prototype，也没有hasOwnProperty
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
// 通过gzip/deflate压缩资源文件
app.use(compression());
// 设置静态资源目录
app.use(express.static(gConfig.web_static_dir));
app.use(favicon(path.join(__dirname, '..', 'public', 'static', 'favicon.ico')));

// 识别设备信息，并存入全局变量res.locals中
app.use(browserInfo.parseUserAgent);

// 校验用户登录态，并填充登录信息
app.use(authenticator.authenticate);


/** *******************路由******************** */

// REST接口
app.use(require('./routes/restful_api_router'));

// 单页应用中非.html结尾的路径重定向到入口html
app.use(historyFallback.router);

// 单页应用路由
if (!gConfig.is_server) {
    // eslint-disable-next-line global-require
    require('../build/express_middleware').useWebpackDevMiddleware(app);
}

// 解析并渲染html文件
app.use(templateRender.router);
// 上一步没有找到可路由的html文件，返回404状态
app.use((req, res) => {
    if (req.method === 'GET') {
        const ext = path.extname(req.path);
        if (ext && (ext === '.html' || ext === '.htm')) {
            res.render('404', {
                url: req.url
            });
            return;
        }
    }
    res.sendStatus(404);
});
// 进入Express默认的路由机制，下发静态资源

// 处理错误信息
app.use(errorHandler.router);
/** ******************************************* */

// 开始监听http请求
app.listen(gConfig.port, (error) => {
    if (error) {
        console.error(error)
    } else {
        console.log(
            `listenning on:${gConfig.port}`
        );
    }
});

function testAccept(req, acceptTypes) {
    return req.headers.accept && acceptTypes.some(type => req.headers.accept.includes(type));
}

module.exports = app;
