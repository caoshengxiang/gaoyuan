/**
 * Created by Ardon on 2016/9/14.
 */

const Promise = require('bluebird');
const dbUtils = require('./../../../db_utils');
const accountSchemaUtils = require('./account_schema_utils');
const DbTaskQueueManager = require('../../utils/db_task_queue');

// 数据读写任务队列
const accountQueue = new DbTaskQueueManager();
// 用户model
const accountModel = dbUtils.createModel(dbUtils.dbName.Account, accountSchemaUtils.accountSchema);
exports.accountModel = accountModel;

/** ********************外露接口************************ */

/**
 * 获取用户的document
 * @param {string} accountOpenId 用户openId
 * @returns {Promise}
 */
exports.getAccount = function (accountOpenId) {
    if (!accountOpenId) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, `accountOpenId: ${accountOpenId}`));
    }
    return accountModel.findOne({accountOpenId})
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 获取用户的document
 * @param {string} account 用户账号
 * @returns {Promise}
 */
exports.findAccountForSignIn = function (account) {
    if (!account) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, `account: ${account}`));
    }
    return accountModel.findOne({account})
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 将新的account数据存入数据库
 * @param {accountSchema} account
 * @returns {Promise}
 */
exports.saveNewAccount = function (account) {
    if (!account) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no account'));
    }
    account = gFilterDocument(account);
    return accountModel.insert({
        account: account.account,
        isDeleted: false
    }, account)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 增加新sessionKey
 * @param {Object} sessionKey
 * @param {String} phone
 * @returns {Promise} 返回完整的account对象
 */
exports.addSessionKey = function (sessionKey, phone) {
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

    return accountModel.findOneAndUpdate({
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
 * @param {String} accountOpenId
 * @returns {Promise}
 */
exports.delSessionKey = function (sessionKey, accountOpenId) {
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

    return accountModel.findOneAndUpdate({
        accountOpenId,
        isDeleted: false
    }, {$pull: {sessionKey: {key: sessionKey}}}, options)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 查询sessionKey
 * @param {string} accountOpenId 手机号
 * @param {string} sessionKey
 * @returns {Promise}
 */
exports.findSessionKey = function (accountOpenId, sessionKey) {
    if (!accountOpenId) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no accountOpenId'));
    }

    return accountModel.findOne({
        accountOpenId,
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
 * @param {object} account
 * @returns {accountSchema}
 */
exports.createAccountDoc = function (account) {
    return new accountModel(account);
}
