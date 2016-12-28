/**
 * 解析ua，并将结果存入res.locals
 */
function parseUserAgent(req, res, next) {
    const ua = req.get('User-Agent');
    if (ua) {
        res.locals.isIOS = /\(i[^;]+;( U;)? CPU.+Mac OS X/.test(ua);
        res.locals.isAndroid = /Android/.test(ua);
        res.locals.isMobile = res.locals.isIOS || res.locals.isAndroid;
        res.locals.isPC = !res.locals.isMobile;
        res.locals.inApp = /Meetin/i.test(ua);
        res.locals.isWechat = /MicroMessenger/.test(ua);

        const matchResultSafari = ua.toString().match(/(Safari)|(Chrome)/g);
        if (matchResultSafari && matchResultSafari.length === 1 && matchResultSafari[0] === 'Safari') {
            res.locals.isSafari = true;
        }
    } else {
        // 默认展示PC版
        res.locals.isPC = true;
    }
    next();
}

exports.parseUserAgent = parseUserAgent;
