/**
 * Created by gukong on 16/7/20.
 */
const profileModel = require('./db/account_model');
const subtask = require('./subtask');

exports.findProfileById = function(profileOpenId) {
    return profileModel.getProfile(profileOpenId)
        .catch(MError.prependCodeLine());
}

/**
 * 创建用户信息
 * @param phoneNum
 * @param properties
 * @param profileSrc
 * @returns {*}
 */
exports.createUserInfo = function(phoneNum, properties) {
    return profileModel.findProfileByPhone(phoneNum)
        .then((profile) => {
            if (!profile) {
                // profile不存在则创建
                return subtask.createProfile(phoneNum, properties)
                    .then(profileModel.saveNewProfile)
            } else {
                return profile;
            }
        })
}
