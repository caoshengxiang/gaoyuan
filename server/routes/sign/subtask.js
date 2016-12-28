/**
 * Created by Ardon on 2016/9/17.
 */

const Promise = require('bluebird');
const openIdGenerator = require('../../openid_generator');
const profileDb = require('../profile/db/profile_model');

const SESSION_TIME_OUT = 30 * 24 * 60 * 60 * 1000;
const CAPTCHA_TIME_OUT = 10 * 60 * 1000;
const CAPTCHA_MIN_SEND_TIME_SECONDS = 60;

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
 * 登录，成功返回带登录态的完整profile，失败返回null
 * @param {profileSchema} profileDoc
 * @param {string} pwd
 * @param {string} phone
 * @returns {null|Promise}
 */
exports.signIn = function(profileDoc, pwd, phone) {
    if (!profileDoc) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, '手机号错误或未注册'));
    }
    if (profileDoc.password != pwd) {
        return Promise.reject(new MError(MError.SIGNIN_FAIL, '密码错误'));
    }
    // 密码正确
    const newSessionKeyObj = {
        key: openIdGenerator.createSessionKey(),
        expireStamp: Date.now() + SESSION_TIME_OUT
    };
    return profileDb.addSessionKey(newSessionKeyObj, phone)
        .then((result) => {
            result.currentSessionKey = newSessionKeyObj.key;
            return result;
        });
}
