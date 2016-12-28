/**
 * Created by Ardon on 2016/9/14.
 */

const Promise = require('bluebird');
const dbUtils = require('./../../../db_utils');
const profileSchemaUtils = require('./profile_schema_utils');
const DbTaskQueueManager = require('../../utils/db_task_queue');

// 数据读写任务队列
const profileQueue = new DbTaskQueueManager();
// 用户model
const profileModel = dbUtils.createModel(dbUtils.dbName.Profile, profileSchemaUtils.profileSchema);
exports.profModel = profileModel;

/** ********************外露接口************************ */

/**
 * 获取用户的document
 * @param {string} profileOpenId 用户openId
 * @returns {Promise}
 */
exports.getProfile = function(profileOpenId) {
    return findProfile(profileOpenId)
        .then(gFilterDocument);
}

/**
 * 获取用户的document
 * @param {string} profileOpenId 用户openId
 * @returns {Promise}
 */
function findProfile(profileOpenId) {
    if (!profileOpenId) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, `profileOpenId: ${profileOpenId}`));
    }
    return profileModel.findOne({
        profileOpenId,
        isDeleted: false
    })
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        });
}

/**
 * 根据手机号查询用户信息
 * @param {string} phone 手机号
 * @param {number,optional} filterSrc 若不为0，则只查询该来源的用户信息。不填则在所有用户信息中查找
 * @returns {Promise}
 */
exports.findProfileByPhone = function(phone, filterSrc) {
    const query = {
        phone,
        isDeleted: false
    };
    if (filterSrc) {
        query.profileSrc = filterSrc;
    }
    return profileModel.findOne(query)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 将新的profile数据存入数据库。如果之前有非注册流程产生的用户信息，则覆盖它。之前填写的信息不保留。这样用户才会感觉自己创建了一个全新的账号
 * @param {profileSchema} profile
 * @returns {Promise}
 */
exports.saveNewProfile = function(profile) {
    if (!profile) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no profile'));
    }

    const options = {
        // Return the document after updates are applied
        new: true,
        // Create a document if one isn't found. Required
        // for `setDefaultsOnInsert`
        upsert: true,
        // 设置默认值，MongoDB >= 2.4 有效
        setDefaultsOnInsert: true
    };
    profile = gFilterDocument(profile);
    return profileModel.findOneAndUpdate({
        phone: profile.phone,
        isDeleted: false
    }, profile, options)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 增加新sessionKey
 * @param {Object} sessionKey
 * @param {String} phone
 * @returns {Promise} 返回完整的profile对象
 */
exports.addSessionKey = function(sessionKey, phone) {
    if (!sessionKey) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no sessionKey'));
    }
    const options = {
        // Return the document after updates are applied
        new: true,
        // Create a document if one isn't found. Required
        // for `setDefaultsOnInsert`
        upsert: false
    };

    return profileModel.findOneAndUpdate({
        phone,
        isDeleted: false
    }, {$push: {sessionKey}}, options)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 删除一个sessionKey
 * @param {Object} sessionKey
 * @param {String} profileOpenId
 * @returns {Promise}
 */
exports.delSessionKey = function(sessionKey, profileOpenId) {
    if (!sessionKey) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no sessionKey'));
    }
    const options = {
        // Return the document after updates are applied
        new: true,
        // Create a document if one isn't found. Required
        // for `setDefaultsOnInsert`
        upsert: false
    };

    return profileModel.findOneAndUpdate({
        profileOpenId,
        isDeleted: false
    }, {$pull: {sessionKey: {key: sessionKey}}}, options)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 查询sessionKey
 * @param {string} profileOpenId 手机号
 * @param {string} sessionKey
 * @returns {Promise}
 */
exports.findSessionKey = function(profileOpenId, sessionKey) {
    if (!profileOpenId) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no profileOpenId'));
    }

    return profileModel.findOne({
        profileOpenId,
        'sessionKey.key': sessionKey,
        isDeleted: false
    })
        .select('sessionKey.$')
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 创建一个数据库使用的用户信息document对象
 * @param {object} profile
 * @returns {profileSchema}
 */
exports.createProfileDoc = function(profile) {
    return new profileModel(profile);
}
