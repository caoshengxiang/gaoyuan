/**
 * Created by Carlos on 2016/8/10.
 */
const Promise = require('bluebird');

// SESSION_KEYS保存所有的key值，新增加字段需要添加对应的key, value默认为1
exports.SESSION_KEYS = {
    // 会议详情basic版，完整key是MEETING_DETAIL_BASIC_PREFIX + meetingOpenId
    MEETING_DETAIL_BASIC_PREFIX: 'MEETING_DETAIL_BASIC_PREFIX_'
}

/**
 * 设置session的键值对
 * @param req
 * @param {string} key 键，必须定义在SESSION_KEYS中
 * @param value 值
 */
exports.setSessionKeyValue = function setSessionKeyValue(req, key, value) {
    return new Promise((resolve, reject) => {
        const session = req.session;
        if (!session) {
            reject(new MError(MError.PARAMETER_ERROR, 'lack req.session'))
            return;
        }
        session[key] = value;
        resolve(value);
    })
}

/**
 *
 * @param req
 * @param key
 */
exports.getSessionKeyValue = function getSessionKeyValue(req, key) {
    return new Promise((resolve, reject) => {
        const session = req.session;
        if (!session) {
            reject(new MError(MError.PARAMETER_ERROR, 'lack req.session'))
            return;
        } else if (!session[key]) {
            reject(new MError(MError.PARAMETER_ERROR, `key: ${key} have no value`));
            return;
        }
        resolve(session[key]);
    })
}

/**
 * 获取一个将数据缓存到指定key处的方法
 * @param req Express的req对象
 * @param {string} key 要缓存数据的key值
 * @returns {Function}
 */
exports.makeCacheFunc = function makeCacheFunc(req, key) {
    return (value) => {
        return exports.setSessionKeyValue(req, key, value)
            .catch((ignore) => {
                // 只是缓存数据而已，出错了可以无视，就当缓存失败
                console.warn(ignore);
                return value;
            });
    }
}
