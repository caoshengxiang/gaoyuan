/**
 * Created by gukong on 16/7/20.
 */
const profileModel = require('./db/profile_model');
const subtask = require('./subtask');

exports.findProfileByPhone = function(phone, filterSrc) {
    return profileModel.findProfileByPhone(phone, filterSrc)
        .catch(MError.prependCodeLine());
}

exports.findProfileById = function(profileOpenId) {
    return profileModel.getProfile(profileOpenId)
        .catch(MError.prependCodeLine());
}

/**
 * 更新用户信息
 * @param phoneNum
 * @param properties
 * @param profileSrc
 * @returns {*}
 */
exports.createUserInfo = function(phoneNum, properties, profileSrc) {
    return profileModel.findProfileByPhone(phoneNum)
        .then((profile) => {
            if (!profile) {
                // profile不存在则创建
                return subtask.createProfile(phoneNum, properties, profileSrc)
                    .then(profileModel.saveNewProfile)
            } else {
                return profile;
            }
        })
}
