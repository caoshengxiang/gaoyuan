/**
 * Created by lnk on 2016/3/21.
 */


/**
 * 校验对象的属性的值是否合法
 * @param obj 要校验的属性所属的对象
 * @param properties 字符串形式的属性路径列表，如['pos.locality','title']
 * @param validateFunc 校验单个对象的值是否合法的方法。返回值表示是否合法。不填则使用默认的方法
 * @return {*} 若属性非法，则返回非法属性的属性路径，否则返回undefined。若obj本身就非法，则返回空字符串
 */
exports.validate = (obj, properties, validateFunc) => {
    if (properties) {
        validateFunc = validateFunc || defaultValidateFunc;
        for (let i = 0; i < properties.length; i++) {
            const invalidPath = validateOneProperty(obj, properties[i], validateFunc);
            if (invalidPath) {
                return invalidPath;
            }
        }
    }
    return null;
}

/**
 * 校验某一级属性的值是否合法
 * @param obj 要校验的属性所属的对象
 * @param propertyPath 通过字符串传入属性的路径，如'a.b'表示obj.a.b属性
 * @param validateFunc 校验单个对象的值是否合法的方法
 * @return {*} 若属性非法，则返回非法属性的属性路径，否则返回undefined。若obj本身就非法，则返回空字符串
 */
function validateOneProperty(obj, propertyPath, validateFunc) {
    if (!validateFunc(obj)) {
        // 不知道obj的名字，所以只好返回空字符串
        return '';
    }

    let parent;
    let objNameInParent;
    const properties = propertyPath.split('.');
    for (let i = 0; i < properties.length; i++) {
        if (Array.isArray(obj)) {
            for (let j = 0; j < obj.length; j++) {
                const invalidPath = validateOneProperty(obj[j], properties.slice(i).join('.'), validateFunc);
                if (invalidPath !== null) {
                    let fullPath = `${properties.slice(0, i).join('.')}[${j}]`;
                    if (invalidPath) {
                        fullPath += `.${invalidPath}`;
                    }
                    return fullPath;
                }
            }
            return null;
        }
        parent = obj;
        objNameInParent = properties[i];
        obj = parent[objNameInParent];
        if (obj === undefined) {
            return properties.slice(0, i + 1).join('.');
        }
    }
    return validateFunc(obj) ? null : propertyPath;
}

function defaultValidateFunc(obj) {
    return !!obj;
}

exports.isEmail = (str) => {
    return /^([a-zA-Z0-9_-]+\.?)+@([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9]{2,4}$/.test(str);
}

/**
 * 是否是国内手机号或测试号
 * @param {string} str
 * @returns {boolean}
 */
exports.isPhoneNum = (str) => {
    const reg = gConfig.enable_test_account ? /^[19]\d{10}$/ : /^1\d{10}$/;
    return reg.test(str);
}

/**
 * 是否是国外手机号
 * @param {string} str
 * @returns {boolean}
 */
exports.isForeignPhoneNum = (str) => {
    const reg = gConfig.enable_test_account ? /^[19]\d{10}$/ : /^1\d{10}$/;
    return !reg.test(str);
}

/**
 * 是否是测试号
 * @param {string} str
 * @returns {boolean}
 */
exports.isPhoneNumForTest = (str) => {
    return gConfig.enable_test_account && /^9\d{10}$/.test(str);
}

/**
 * 尝试从字符串中提取手机号
 * @param {string} phoneText
 * @param {boolean} allowForeignPhone 是否允许输入外国手机号
 * @returns {string|null}
 */
exports.getPhoneNumber = function tryToGetPhoneNumber(phoneText, allowForeignPhone) {
    // 替换掉实体字符，全角空格
    // eslint-disable-next-line no-irregular-whitespace
    phoneText = phoneText.replace(/&#\d{1,3};/g, ' ').replace(/　/g, ' ').trim();
    // 优先尝试解析为国内手机号
    return getChinesePhoneNumber(phoneText) || allowForeignPhone && getForeignPhoneNumber(phoneText) || null;
}

/**
 * 尝试从字符串中提取外国手机号
 * @param {string} phoneText
 * @returns {string|null}
 */
function getForeignPhoneNumber(phoneText) {
    // 如果存在大段连续数字，只提取第一个
    const match = /(\d{7,20})/.exec(phoneText);
    if (match && match.length > 1) {
        return match[1];
    }
    // 可能是中间有连字符，去掉非数字，剩下的作为手机号
    phoneText = phoneText.replace(/[^\d]/g, '');
    return /^\d{7,20}$/.test(phoneText) ? phoneText : null;
}

/**
 * 尝试从字符串中提取国内手机号
 * @param {string} phoneText
 * @returns {string|null}
 */
function getChinesePhoneNumber(phoneText) {
    // 去掉+86。识别加上手机号的1开头，是避免误识别座机号
    phoneText = phoneText.replace(/(^|\+)861/g, '1');
    // 尝试提取11位连续数字
    let phoneReg = gConfig.enable_test_account ? /([19]\d{10})/ : /(1\d{10})/;
    const match = phoneReg.exec(phoneText);
    if (match && match.length > 1) {
        return match[1];
    }
    // 可能是中间有连字符，去掉非数字，剩下的作为手机号
    phoneText = phoneText.replace(/[^\d]/g, '');
    phoneReg = gConfig.enable_test_account ? /^[19]\d{10}$/ : /^1\d{10}$/;
    return phoneReg.test(phoneText) ? phoneText : null;
}
