/**
 * Created by Ardon on 2016/9/14.
 */

const Promise = require('bluebird');
const dbUtils = require('./../../../db_utils');
const DbTaskQueueManager = require('../../utils/db_task_queue');
const openIdGenerator = require('../../../openid_generator');
const accountSchemaUtils = require('./account_schema_utils');

exports.ACCOUNT_TYPE = accountSchemaUtils.ACCOUNT_TYPE;
// 默认session过期时间
exports.SESSION_TIME_OUT = 30 * 24 * 60 * 60 * 1000;

// 数据读写任务队列
const accountQueue = new DbTaskQueueManager();
// 用户model
const AccountModel = dbUtils.createModel(dbUtils.dbName.Account, accountSchemaUtils.accountSchema);
exports.AccountModel = AccountModel;

/** ********************外露接口************************ */

/**
 * 获取用户的document
 * @param {string} accountOpenId 用户openId
 * @returns {Promise}
 */
exports.getAccount = function(accountOpenId) {
    if (!accountOpenId) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, `accountOpenId: ${accountOpenId}`));
    }
    return AccountModel.findOne({accountOpenId})
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
}

/**
 * 获取用户的document
 * @param {string} name 用户账号
 * @returns {Promise}
 */
exports.getAccountByName = function(name) {
    if (!name) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, `name: ${name}`));
    }
    return AccountModel.findOne({name})
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
}

/**
 * 将新的account数据存入数据库
 * @param {accountSchema} account
 * @returns {Promise}
 */
exports.saveNewAccount = function(account) {
    if (!account) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no account'));
    }
    return account.save()
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
}

/**
 * 增加新sessionKey
 * @param {Object} session
 * @param {String} accountOpenId
 * @returns {Promise} 返回完整的account对象
 */
exports.addSession = function(session, accountOpenId) {
    if (!session) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no sessionKey'));
    }
    const options = {
        // Return the document after updates are applied
        new: true,
        // Create a document if one isn't found. Required
        // for `setDefaultsOnInsert`
        upsert: false
    };

    // TODO 这里的push不对吧？应该是向sessionKey数组里面push吧
    // return AccountModel.findOneAndUpdate({accountOpenId}, {$push: {sessions: session}}, options)
    return AccountModel.findOneAndUpdate({accountOpenId}, {$push: {session}}, options)
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
        .then(gFilterDocument);
}

/**
 * 查询session对象
 * @param {string} sessionKey
 * @returns {Promise}
 */
exports.findSession = function(sessionKey) {
    if (!sessionKey) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, 'no sessionKey'));
    }

    return AccountModel.findOne({
        'sessions.key': sessionKey
    })
        .select('sessions.$')
        .catch((error) => {
            throw new MError(MError.ACESS_DATABASE_ERROR, error);
        })
}

/**
 * 创建一个数据库使用的用户信息document对象
 * @param {string} name 登录账户名
 * @param {string} password 密码
 * @param {number} type 账号类型
 * @returns {accountSchema}
 */
exports.createAccountDoc = function(name, password, type) {
    return new AccountModel({
        accountOpenId: openIdGenerator.createAccountOpenId(),
        sessionKey: [],
        name,
        password,
        // TODO 改用cdn路径
        avatar: `${gConfig.host}/static/images/default_avatar.png`,
        type,
    });
}

/**
 * 创建一个session
 * @param {string} ip 登录时的ip地址
 * @return {{key: string, expireAt: Date, ip: *, data: {}}}
 */
exports.createSession = function(ip) {
    return {
        key: openIdGenerator.createSessionKey(),
        expireAt: new Date(Date.now() + exports.SESSION_TIME_OUT),
        ip,
        data: {},
    }
}
