/**
 * Created by lnk on 2016/12/8.
 */

const url = require('url');
const entryConfigs = require('../../build/webpack_entry');

const options = {
    htmlBase: '/',
    routes: entryConfigs.map(config => ({
        prefix: config.historyApiPath,
        target: config.htmlName,
    })),
};

/**
 * 设置SPA页面刷新时重定向到的html路径前缀
 * @param {string} htmlBase 重定向后的地址的前缀
 */
exports.setHtmlBase = function setHtmlBase(htmlBase) {
    options.htmlBase = htmlBase;
}

/**
 * SPA页面刷新时重定向html请求用的中间件
 */
exports.router = (req, res, next) => {
    if (req.method !== 'GET' || !res.locals.isAcceptHtml || req.headers.accept.includes('application/json')) {
        // console.log('Not rewriting', req.method, req.url, `because the method ${req.method} accept ${req.headers.accept}.`);
        next();
        return;
    }

    const parsedUrl = url.parse(req.url);

    if (parsedUrl.pathname.includes('.')) {
        // console.log('Not rewriting', req.method, req.url, 'because the path includes a dot (.) character.');
        next();
        return;
    }

    let rewriteTarget = `${options.htmlBase}index.html`;
    options.routes.some((route) => {
        if (parsedUrl.pathname.startsWith(route.prefix)) {
            rewriteTarget = options.htmlBase + route.target;
            return true;
        }
        return false;
    })
    console.log('Rewriting', req.method, req.url, 'to', rewriteTarget);
    req.url = rewriteTarget;
    next();
};
