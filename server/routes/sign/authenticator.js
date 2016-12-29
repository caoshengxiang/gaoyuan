/**
 * Created by lnk on 2016/6/1.
 */
const accountDb = require('../account/db/account_model');

exports.authenticate = (req, res, next) => {
    if (req.cookies.meetin_sk) {
        // 已登录
        accountDb.findSessionKey(req.cookies.meetin_ui, req.cookies.meetin_sk)
            .then((profile) => {
                if (profile && profile.sessionKey.length && profile.sessionKey[0].expireStamp > Date.now()) {
                    res.locals.myInfo = {
                        openId: req.cookies.meetin_ui,
                        name: req.cookies.meetin_nm,
                    };
                    next();
                } else {
                    // 登录态已过期
                    next(new MError(MError.NEED_RELOGIN));
                }
            })
            .catch(MError.prependCodeLine())
            .catch(next);
    } else {
        // 未登录
        next(new MError(MError.NOT_SIGNIN));
    }
};

exports.clearCookie = (res) => {
    // 自己的openId
    res.clearCookie('meetin_ui');
    // sessionKey
    res.clearCookie('meetin_sk');
    // 自己的姓名
    res.clearCookie('meetin_nm');
}
