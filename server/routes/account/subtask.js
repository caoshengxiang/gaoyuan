/**
 * Created by gukong on 16/7/20.
 */
const crypto = require('crypto');
const accountDb = require('./db/account_model');

/**
 * 对用户发过来的密码md5进行二次加密，得到最终可存入数据库的密码
 */
exports.getFinalPassword = function(password) {
    // 末尾加盐，以对抗二次彩虹表
    return crypto.createHash('md5').update(`${password}m`).digest('hex');
}

/**
 * 创建并保存账号
 * @param {string} name 登录账户名
 * @param {string} password 密码
 * @param {string} ip
 * @param {number} type 账号类型
 * @returns {Promise}
 */
exports.createAccount = function(name, password, ip, type) {
    return accountDb.getAccountByName(name)
        .then((account) => {
            if (account) {
                return Promise.reject(new MError(MError.USER_HAS_EXISTED, `用户${name}已存在`));
            }
            const accountDoc = accountDb.createAccountDoc(name, password, type);
            accountDoc.sessions.push(accountDb.createSession(ip));
            return accountDb.saveNewAccount(accountDoc)
                .then(gFilterDocument);
        })
}
