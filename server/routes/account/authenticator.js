/**
 * Created by lnk on 2016/6/1.
 */
const accountDb = require('../account/db/account_model');
const subtask = require('./subtask');

// 不用检测登录态的请求
const whiteList = [
    '/404.html',
    '/error.html',
    // TODO 不存在该页面了
    '/sign/signin.html',
    '/account/signin',
    '/account/signup',
    '/account/signout',
];

/**
 * 校验各请求的登录态
 * @param req
 * @param res
 * @param next
 */
exports.authenticate = (req, res, next) => {
    // TODO 测试数据
    next();
    return;

    if (whiteList.includes(req.path)) {
        // 不用检测登录态
        next();
    } else if (req.cookies.meetin_admin_sk) {
        // 已登录
        accountDb.findSession(req.cookies.meetin_admin_sk)
            .then(gFilterDocument)
            .then((account) => {
                const session = account && account.sessions.length && account.sessions[0];
                if (session && session.expireAt > new Date()) {
                    // 把session数据存入res.locals.session
                    res.locals.account = account;
                    res.locals.session = session.data;
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

/**
 * 登录
 * @param {string} name
 * @param {string} password
 * @param {string} ip
 * @param {object} res
 * @returns {Promise}
 */
exports.signIn = function (name, password, ip, res) {
    if (!name || !password) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, `name:${name} password:${password}`));
    }

    return accountDb.getAccountByName(name)
        .then(accountDoc => signIn(accountDoc, subtask.getFinalPassword(password), ip))
        .then(sessionKey => saveSessionToCookie(sessionKey, res))
        .catch((error) => {
            clearCookie(res);
            throw error;
        })
        .catch(MError.prependCodeLine());
}

/**
 * 注册并登录
 * @param {string} name
 * @param {string} password
 * @param {string} ip
 * @param {object} res
 * @returns {Promise}
 */
exports.signUp = function (name, password, ip, res) {
    if (!name || name.length < 3) {
        return Promise.reject(new MError(MError.SIGNIN_ACCOUNT_INVALID));
    }
    if (!password) {
        return Promise.reject(new MError(MError.SIGNIN_PASSWORD_INVALID));
    }
    return subtask.createAccount(name, subtask.getFinalPassword(password), ip, accountDb.ACCOUNT_TYPE.GUEST)
        .then((doc) => {
            const currentSessionKey = doc.sessions.length && doc.sessions[0].key || null;
            console.log('new sessionkey:', currentSessionKey, 'new openid:', doc.accountOpenId);
            return currentSessionKey;
        })
        .then(sessionKey => saveSessionToCookie(sessionKey, res))
        .catch(MError.prependCodeLine());
}

/**
 * 登出
 * @param {string} sessionKey
 * @param {object} res
 * @returns {Promise}
 */
exports.signOut = function (sessionKey, res) {
    // 数据库中的session对象不清除了。作为登录历史留在那吧
    return clearCookie(res);
}

/**
 * 登出时清除浏览器上的cookie
 * @param {object} res
 */
function clearCookie(res) {
    // sessionKey
    res.clearCookie('meetin_admin_sk');
}

/**
 * 登录，成功返回带登录态的完整account，失败返回null
 * @param {accountSchema} accountDoc
 * @param {string} password 密码
 * @param {string} ip
 * @returns {null|Promise}
 */
function signIn(accountDoc, password, ip) {
    if (!accountDoc) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, '手机号错误或未注册'));
    }
    if (accountDoc.password !== password) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, '密码错误'));
    }
    // 密码正确
    const newSession = accountDb.createSession(ip);
    return accountDb.addSession(newSession, accountDoc.accountOpenId)
        .return(newSession.key);
}

/**
 * 将sessionKey保存到浏览器cookie中
 * @param {string} sessionKey
 * @param {object} res
 * @returns {null|Promise}
 */
function saveSessionToCookie(sessionKey, res) {
    if (!sessionKey) {
        return Promise.reject(new MError(MError.LOGIN_NO_SESSION_KEY, 'no sessionKey'));
    }

    console.log('new sessionKey:', sessionKey);

    res.cookie('meetin_admin_sk', sessionKey, {maxAge: 2592000000, httpOnly: true});
    return Promise.resolve({});
}
