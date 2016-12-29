/**
 * Created by Ardon on 2016/9/17.
 */

const Promise = require('bluebird');
const openIdGenerator = require('../../openid_generator');
const accountDb = require('../account/db/account_model');

const SESSION_TIME_OUT = 30 * 24 * 60 * 60 * 1000;

/**
 * 创建一个sessionKey
 * @returns {object}
 */
exports.createSessionKey = function() {
    return {
        key: openIdGenerator.createSessionKey(),
        expireStamp: Date.now() + SESSION_TIME_OUT
    }
}

/**
 * 登录，成功返回带登录态的完整account，失败返回null
 * @param {accountSchema} accountDoc
 * @param {string} pwd
 * @param {string} phone
 * @returns {null|Promise}
 */
exports.signIn = function(accountDoc, pwd, phone) {
    if (!accountDoc) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, '手机号错误或未注册'));
    }
    if (accountDoc.password != pwd) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, '密码错误'));
    }
    // 密码正确
    const newSessionKeyObj = {
        key: openIdGenerator.createSessionKey(),
        expireStamp: Date.now() + SESSION_TIME_OUT
    };
    return accountDb.addSessionKey(newSessionKeyObj, phone)
        .then((result) => {
            result.currentSessionKey = newSessionKeyObj.key;
            return result;
        });
}
