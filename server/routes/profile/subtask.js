/**
 * Created by gukong on 16/7/20.
 */
const Promise = require('bluebird');
const profileDb = require('./db/profile_model');
const openIdGenerator = require('../../openid_generator');

/**
 * 注册，并返回带登录态的完整profile
 * @param phone 注册手机号
 * @param properties 附加属性，当是真实注册时包含pwd、name、sessionKey，当时报名时注册时包含用户填写的附加属性
 * @returns {*}
 */
exports.createProfile = function(phone, properties) {
    let pwd, name, sessionKey;
    pwd = properties.pwd;
    name = properties.name;
    sessionKey = properties.sessionKey;

    return createProfileObj(phone, name, pwd, sessionKey)
        .then(profileDb.createProfileDoc);
}

function createProfileObj(phone, name, pwd, sessionKey) {
    const profile = {};
    profile.profileOpenId = openIdGenerator.createRealUserOpenId();
    profile.sessionKey = sessionKey ? [sessionKey] : [];
    profile.name = name;
    profile.phone = phone;
    profile.avatar = `${gConfig.host}/static/images/default_avatar.png`;
    profile.password = pwd;
    return Promise.resolve(profile);
}
