/**
 * 提供在所有页面都可以使用的通用的方法
 */
const commonUtils = {
    getUrlParam,
    isPhoneNum,
    isEmail,
    getNewId,
    hashCode,
    // 利用getter和setter访问sessionStorage，支持直接读写object。这里的取值表示是否在读取过一次后就删除
    sessionStorage: {
        // 签到页面向报名页面传递的手机号
        REGISTER_PHONE_FROM_CHECKIN: true,
        // 发短信页面数据
        SEND_SMS_DATA: true,
        // 批量导入参会人员时用到的会议报名项表头
        AUDIENCE_IMPORT_MEETING_REGLIST: false,
        // 预览表单填写页面时用到的表单内容
        FORM_PREVIEW_DATA: false,
        // 预览活动详情页面时用到的表单内容
        MEETING_PREVIEW_DATA: false,
        // 进入会员招募表填写页面时要自动填充的已验证过的手机号
        VIP_FORM_VERIFIED_PHONE: true,
        // 小游戏10003生成砍价主页时传递的数据
        INTERACTION_10003_JOIN_DATA: true,
    },
    // 利用getter和setter访问localStorage，支持直接读写object。这里的取值表示是否在读取过一次后就删除
    localStorage: {
        // 注册页面自动填写的手机号
        REGISTER_PHONE: false,
        // 注册页面自动填充的报名信息
        REGISTER_REG_INFO_LIST: false,
        // 注册等页面缓存的会议详情的openid
        REGISTER_MEETING_ID: false,
        // 摇奖页面使用签到时的手机号来摇奖
        INTERACTION_10001_PHONE: false,
        // 填过的表单id历史，最多保存5个
        FORM_FILLED_FORM_LIST: false,
    },
    interval,
    cancelable,
    tryFunc,
    getEventBus,
    stringifyUrlParams,
    parseDate,
    formatDate,
    getHost
};
let idMaker = 1;
initStorage(commonUtils.sessionStorage, sessionStorage);
initStorage(commonUtils.localStorage, localStorage);

/**
 * 初始化storage代理
 * @param {object} proxy
 * @param {Storage} stub
 */
function initStorage(proxy, stub) {
    for (const key in proxy) {
        if (proxy.hasOwnProperty(key)) {
            // 必须放进函数调用，以利用闭包固化key
            redefineKey(key, proxy[key]);
        }
    }

    function redefineKey(key, isOneshot) {
        Object.defineProperty(proxy, key, {
            get() {
                const value = JSON.parse(stub.getItem(key));
                if (isOneshot) {
                    stub.removeItem(key);
                }
                return value;
            },
            set(value) {
                try {
                    stub.setItem(key, JSON.stringify(value));
                } catch (oException) {
                    if (oException.name === 'QuotaExceededError' && stub.length) {
                        stub.clear();
                        stub.setItem(key, JSON.stringify(value));
                    }
                }
            }
        });
    }
}

/**
 * 获取url中的指定参数
 * @param   {string} name url中的参数名字
 * @returns {null | string} 若获取失败则返回null
 */
function getUrlParam(name) {
    const matcher = location.search.match(`${name}=([^&]+)`);
    if (!matcher || matcher.length < 2) {
        console.log(`No "${name}" in url`);
        return null;
    }
    return matcher[1];
}

function isPhoneNum(str) {
    return /^(\+?86)?\d{11}$/.test(str);
}

function isEmail(str) {
    return /^([a-zA-Z0-9_-]+\.?)+@([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9]{2,4}$/.test(str);
}

/**
 * 生成一个新id
 *
 * @returns {number}
 */
function getNewId() {
    return idMaker++;
}

/**
 * 根据字符串生成一个整型32位的哈希码
 * @param {string} str
 * @return {number}
 */
function hashCode(str) {
    let hash = 0;
    if (!str) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash &= hash; // Convert to 32bit integer
    }
    return hash;
}

/**
 * generate a new function that can be run unlimited times
 * you can call [the returned func].cancel() to cancel it
 */
function interval(fn, milliseconds) {
    let timer;
    const innerFunc = function innerFunc(...args) {
        const thisObj = this
        if (!timer) {
            timer = setInterval(() => {
                fn.apply(thisObj, args);
            }, milliseconds);
        }
        return undefined;
    };
    innerFunc.cancel = function cancel() {
        clearInterval(timer);
        timer = undefined;
    };
    return innerFunc;
}

/**
 * 将方法fn包装一层，返回值上可以调用cancel方法，让fn无法再调用
 * @param {Function} fn
 */
function cancelable(fn) {
    const innerFunc = function innerFunc(...args) {
        if (fn) {
            return fn.apply(this, args);
        }
        return undefined;
    };
    innerFunc.cancel = function cancel() {
        // noinspection JSValidateTypes
        fn = undefined;
    };
    innerFunc.isCanceled = function isCanceled() {
        return fn === undefined;
    };
    return innerFunc;
}

/**
 * 重复执行指定函数，直到成功为止
 * @param {Function} fn 要重试的方法，需要返回一个promise
 * @param {number} intervalMs 失败后重试的时间间隔毫秒数
 * @param {number} maxTimes 最大执行次数，包括第一次
 * @return {Promise}
 */
function tryFunc(fn, intervalMs, maxTimes) {
    return new Promise((resolve, reject) => {
        let currentTimes = 1;
        run();

        function run() {
            fn().then(resolve, retry);
        }

        function retry(e) {
            if (++currentTimes <= maxTimes) {
                setTimeout(run, intervalMs);
            } else {
                reject(e);
            }
        }
    })
}

let eventBus;

/**
 * 获取一个基于vue的事件总线，用来在组件之间发送事件
 * 用法：
 * <pre>
 * commonUtils.getEventBus().$emit('click-submit', { postData: this.postData });
 * </pre>
 *
 * <pre>
 * created: function () {
     *      commonUtils.getEventBus().$on('click-submit', this.submit)
     * },
 * // 最好在组件销毁前清除事件监听
 * beforeDestroy: function () {
     *      commonUtils.getEventBus().$off('click-submit', this.submit)
     * },
 * </pre>
 * @returns {Vue}
 */
function getEventBus() {
    if (!eventBus) {
        // eslint-disable-next-line no-undef
        eventBus = new Vue();
    }
    return eventBus;
}

/**
 * 将查询参数转换为字符串，如果传了两个参数，可自动进行拼接
 * @param {string|object} paramsObj 对象形式的查询参数。其中的undefined属性会被过滤掉
 * @param {object,optional} url 待拼接的url。拼接时会检测其中是否已含有问号
 * @returns {string} 拼接好的url。若没填url参数则返回字符形式的查询参数
 */
function stringifyUrlParams(url, paramsObj) {
    if (paramsObj === undefined) {
        // 只传了一个参数的情况
        paramsObj = url;
        url = undefined;
    }
    const pairs = [];
    for (const key in paramsObj) {
        if (paramsObj.hasOwnProperty(key) && paramsObj[key] !== undefined && paramsObj[key] !== null) {
            pairs.push(`${key}=${paramsObj[key]}`);
        }
    }
    const query = pairs.join('&');
    if (!url) {
        return query;
    }
    return url.includes('?') ? (`${url}&${query}`) : (`${url}?${query}`);
}

/**
 * 解析日期字符串
 * @param {string} text 支持 2010-04-20 这样的字符串，年月日中间可以用任意字符连接
 * @returns {Number}
 */
function parseDate(text) {
    if (!text) {
        return 0;
    }
    const dateTexts = text.split(/\D+/);
    if (!dateTexts.length) {
        return 0;
    }
    const date = new Date();
    date.setFullYear(parseInt(dateTexts[0], 10));
    date.setMonth(dateTexts.length > 1 ? parseInt(dateTexts[1] - 1, 10) : 0);
    date.setDate(dateTexts.length > 2 ? parseInt(dateTexts[2], 10) : 1);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
}

/**
 * 格式化日期字符串
 * @param {number} stamp 时间戳
 * @param {boolean} noDate 只格式化年和月
 * @returns {string}
 */
function formatDate(stamp, noDate) {
    if (!stamp) {
        return '';
    }
    const date = new Date(stamp);
    const year = date.getFullYear();
    const month = (date.getMonth() >= 9 ? '' : '0') + (date.getMonth() + 1);
    const day = (date.getDate() >= 10 ? '' : '0') + date.getDate();
    if (noDate) {
        return `${year}-${month}`;
    }
    return `${year}-${month}-${day}`;
}

/**
 * 获取当前网址里面的 host
 * 示例 http://meetin.co
 * @returns {string}
 */
function getHost() {
    return location.origin;
}

export default commonUtils;
