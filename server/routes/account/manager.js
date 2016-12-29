/**
 * Created by lnk on 16/12/30.
 */
const accountDb = require('./db/account_model');

/**
 * 获取用户的document
 * @param {string} accountOpenId 用户openId
 * @returns {Promise}
 */
exports.getAccount = function(accountOpenId) {
    return accountDb.getAccount(accountOpenId)
        .then(gFilterDocument)
        .catch(MError.prependCodeLine());
}
