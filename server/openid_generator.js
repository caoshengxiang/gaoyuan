/**
 * 以snowflake算法为基础，经过可逆的混淆步骤后生成随机字符串。以后可以改为C层实现提高性能
 * Created by Lnk on 2016/8/22.
 */
// console.log(require("underscore").shuffle("ABCDEFGHIJKLMNOPQRSTWUVXYZabcdefghijklmnopqrstuvwxyz0123456789".split("")).join(""));
const CHARS = 'GQM5s7KdZhr8zFV3X4CHfU6kIq2cgTBDnoJamSyNOeYW9Rt01pLblvwiuPExjA';
// 去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
const CHARS_HUMAN_FRIENDLY = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
const FINAL_RADIX = CHARS.length;

const TYPE_MEMBER = 1;
const TYPE_MEETING = 2;
const TYPE_FORM = 3;
const TYPE_REAL_USER = 4;
const TYPE_SESSIONKEY = 5;
const TYPE_TRADE_NUMBER = 6;
const TYPE_TICKET = 7;
const TYPE_QUESTION = 8;
const TYPE_ACTION = 9;
const TYPE_MAX = 9; // 遍历用的最大值

// snowflake的参数
const sfConfig = {};

/**
 * 初始化snowflake用到的配置
 */
function initSnowflakeConfig() {
    sfConfig.twepoch = 1468834974657;
    sfConfig.workerIdBits = 10;
    sfConfig.maxWrokerId = -1 ^ (-1 << sfConfig.workerIdBits);
    sfConfig.sequenceBits = 12;
    sfConfig.workerIdShift = sfConfig.sequenceBits;
    sfConfig.timestampShift = sfConfig.sequenceBits + sfConfig.workerIdBits;
    sfConfig.sequenceMask = -1 ^ (-1 << sfConfig.sequenceBits);
    sfConfig.timestampBase = 1 << sfConfig.timestampShift;
    sfConfig.lastTimestamp = -1;
    // TODO 这里应该从数据库或环境变量中读取
    sfConfig.workerId = gConfig.dev ? 2 : 1; // 设备id
    sfConfig.sequence = exports.randomNumber(4096); // 12位序列号

    if (sfConfig.workerId > sfConfig.maxWrokerId || sfConfig.workerId < 0) {
        throw new MError(MError.CREATE_OPENID_ERROR, `sfConfig.workerId must max than 0 and small than sfConfig.maxWrokerId-[${sfConfig.maxWrokerId}]`);
    }
}

/**
 * 使用snowflake算法创建一个id。 时间戳 + 10位workId + 12位sequence
 * @returns {Array} 62进制的数字数组，方便后面的计算
 */
function createSnowflakeId() {
    let timestamp = Date.now();
    if (sfConfig.lastTimestamp === timestamp) {
        sfConfig.sequence = (sfConfig.sequence + 1) & sfConfig.sequenceMask;
        if (sfConfig.sequence === 0) {
            timestamp = tilNextMillis(sfConfig.lastTimestamp);
        }
    } else if (sfConfig.lastTimestamp < timestamp) {
        sfConfig.sequence = 0;
    } else {
        throw new MError(MError.CREATE_OPENID_ERROR, `Clock moved backwards. Refusing to generate id for ${sfConfig.lastTimestamp - timestamp}`);
    }

    sfConfig.lastTimestamp = timestamp;
    // 低sfConfig.timestampShift位
    const low = (sfConfig.workerId << sfConfig.workerIdShift) | sfConfig.sequence;
    // 高位
    const high = timestamp - sfConfig.twepoch;
    // 当作sfConfig.timestampBase进制数进行处理，但实际上high部分的取值已经超过了sfConfig.timestampBase
    return changeRadix([high, low], sfConfig.timestampBase, FINAL_RADIX);
}

function tilNextMillis(lastTimestamp) {
    let timestamp = Date.now();
    while (timestamp <= lastTimestamp) {
        timestamp = Date.now();
    }
    return timestamp;
}

/**
 * 创建一个openId，13位字符串
 * @param {number} type 最大为FINAL_RADIX
 * @return {string}
 */
function createOpenId(type) {
    if (type <= 0 || type > TYPE_MAX || type > FINAL_RADIX) {
        throw new MError(MError.CREATE_OPENID_ERROR, `type must max than 0 and small than [${Math.min(TYPE_MAX, FINAL_RADIX)}]`);
    }

    // 用来确保唯一性的数字字符串，有自增特性。这里使用FINAL_RADIX进制，可以缩短id长度
    const array = createSnowflakeId();
    array.push(type);
    // 随机数让整个字符串变随机
    array.push(exports.randomNumber(FINAL_RADIX));
    // 每个数字与它低一位的数字做运算
    for (let i = array.length - 1; i > 0; i--) {
        array[i - 1] = (array[i - 1] + array[i]) % FINAL_RADIX;
    }
    // 转为字符串
    return array.map(pos => CHARS.charAt(pos)).join('');
}

/**
 * 解析openId，获取其中的信息
 * @param openId
 * @returns {{workerId: number, timestamp: Date, type: number}}
 */
exports.parseOpenId = function(openId) {
    const result = {};
    const array = openId.split('').map(char => CHARS.indexOf(char));
    for (let i = 0; i < array.length - 1; i++) {
        array[i] = array[i] - array[i + 1] + (array[i] < array[i + 1] ? FINAL_RADIX : 0);
    }
    result.type = array[array.length - 2];

    const snowflakeData = changeRadix(array.slice(0, array.length - 2), 62, sfConfig.timestampBase);
    let high = 0;
    for (let i = 0; i < snowflakeData.length - 1; i++) {
        high = high * sfConfig.timestampBase + snowflakeData[i];
    }
    result.timestamp = new Date(high + sfConfig.twepoch);

    const low = snowflakeData[snowflakeData.length - 1];
    result.workerId = low >> sfConfig.workerIdShift;
    return result;
}

/**
 * 将from进制的数字数组转为to进制的数字数组
 * @param {Array} array
 * @param {number} from
 * @param {number} to
 * @returns {Array}
 */
function changeRadix(array, from, to) {
    const len = array.length;
    const result = [];
    let startPos = 0;
    while (true) {
        let remainder = 0;
        // 整个除一遍
        for (let i = startPos; i < len; i++) {
            const item = array[i];
            let newItem = (item + remainder * from);
            remainder = newItem % to;
            newItem = newItem / to | 0;
            if (i === startPos && newItem === 0) {
                if (++startPos >= len) {
                    result.unshift(remainder);
                    return result;
                }
            } else {
                array[i] = newItem;
            }
        }
        result.unshift(remainder);
    }
}

/**
 * 生成指定长度的随机字符串序列
 * @param {number} len
 * @param {boolean} humanFriendly
 * @returns {string}
 */
exports.randomString = function(len, humanFriendly) {
    len = len || 32;
    const chars = humanFriendly ? CHARS_HUMAN_FRIENDLY : CHARS;
    const maxPos = chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += chars.charAt(exports.randomNumber(maxPos));
    }
    return pwd;
}

/**
 * 生成指定范围的随机整数。支持两个参数(min, max)和一个参数(max)
 * @param {number} min 最小值，不指定的话则为0
 * @param {number, optional} max 最大值
 * @returns {number}
 */
exports.randomNumber = function(min, max) {
    if (max === undefined) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min));
}

/**
 * 获取会员openId
 * @returns {string}
 */
exports.createMemberOpenId = function() {
    return createOpenId(TYPE_MEMBER);
};

/**
 * 获取会议openId
 * @returns {string}
 */
exports.createMeetingOpenId = function() {
    return createOpenId(TYPE_MEETING);
};

/**
 * 获取表单openId
 * @returns {string}
 */
exports.createFormOpenId = function() {
    return createOpenId(TYPE_FORM);
};

/**
 * 获取真实注册用户的openId
 * @returns {string}
 */
exports.createRealUserOpenId = function() {
    return createOpenId(TYPE_REAL_USER);
};

/**
 * 获取sessionKey
 * @returns {string}
 */
exports.createSessionKey = function() {
    return createOpenId(TYPE_SESSIONKEY);
};

/**
 * 获取唯一订单号
 * @returns {string}
 */
exports.createTradeNumber = function() {
    return createOpenId(TYPE_TRADE_NUMBER);
};

/**
 * 获取ticketOpenId
 * @returns {string}
 */
exports.createTicketOpenId = function() {
    return createOpenId(TYPE_TICKET);
}

/**
 * 获取表单问题的openId
 * @returns {string}
 */
exports.createQuestionOpenId = function() {
    return createOpenId(TYPE_QUESTION);
}

/**
 * 获取活动openId
 * @returns {string}
 */
exports.createActionOpenId = function() {
    return createOpenId(TYPE_ACTION);
}

initSnowflakeConfig();
