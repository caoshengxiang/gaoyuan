/**
 * Created by gukong on 16/7/20.
 */
const Promise = require('bluebird');
const accountDb = require('./db/account_model');
const openIdGenerator = require('../../openid_generator');

/**
 * 注册，并返回带登录态的完整account
 * @param phone 注册手机号
 * @param properties 附加属性，当是真实注册时包含pwd、name、sessionKey，当时报名时注册时包含用户填写的附加属性
 * @returns {*}
 */
exports.createAccount = function(phone, properties) {
    let pwd, name, sessionKey;
    pwd = properties.pwd;
    name = properties.name;
    sessionKey = properties.sessionKey;

    return createAccountObj(phone, name, pwd, sessionKey)
        .then(accountDb.createAccountDoc);
}

function createAccountObj(phone, name, pwd, sessionKey) {
    const account = {};
    account.accountOpenId = openIdGenerator.createRealUserOpenId();
    account.sessionKey = sessionKey ? [sessionKey] : [];
    account.name = name;
    account.phone = phone;
    account.avatar = `${gConfig.host}/static/images/default_avatar.png`;
    account.password = pwd;
    return Promise.resolve(account);
}
