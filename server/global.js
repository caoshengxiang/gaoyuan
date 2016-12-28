/**
 * 在此声明全局变量
 */
const path = require('path');
const Promise = require('bluebird');
const _ = require('underscore');


// 向前端返回数据时用的异常类
global.MError = require('./routes/utils/merror');

global.gConfig = require('./config/global');

// 把要返回给网页端的数据封装成标准的格式
global.gWrapPromiseResult = function gWrapPromiseResult(result) {
    if (result && (result._id || result.length && result[0]._id)) {
        throw new MError(MError.CANNOT_SEND_NATIVE_DATA, '没有转换格式的数据库记录不能下发到浏览器！');
    }
    return {
        data: result,
        status: {
            code: 0
        }
    };
};

// 请求处理结束时用的方法，将数据封装成标准对象，并下发到浏览器
Promise.prototype.thenSend = function thenSend(req, res, next) {
    return this.then(gWrapPromiseResult)
        .then(res.send.bind(res))
        .catch(next);
}

/**
 * 下发到客户端时，过滤掉从mongo中查出来的数据的_id，__v，isDeleted属性，删去标记为已删除的数据，并转为普通对象。
 * 支持处理数组或单个对象
 */
global.gFilterDocument = function gFilterDocument(doc) {
    return filterDocument(doc, true, ['_id', '__v', 'isDeleted']);
}

/**
 * 通过bulk的update存入数据库时，过滤掉无法修改的_id等属性，并转为普通对象。
 * 支持处理数组或单个对象
 */
global.gFilterDocumentForBulk = function gFilterDocumentForBulk(doc) {
    return filterDocument(doc, false, ['_id', '__v']);
}

// 通用检查参数是否存在方法
global.checkParamsExist = function checkParamsExist(...args) {
    let haveUndefined = false;
    let errorMsg = '';
    _.forEach(args, (value, key) => {
        if (typeof value === 'undefined') {
            haveUndefined = true;
        }
        errorMsg += `参数${key}=${value}, `
    })
    if (haveUndefined) {
        return Promise.reject(new MError(MError.PARAMETER_ERROR, errorMsg));
    }
    return Promise.resolve();
}

function filterDocument(doc, dropDeleted, dropPropertyNames) {
    if (!doc) {
        return doc;
    }
    if (doc instanceof Date) {
        return doc;
    }
    if (Array.isArray(doc)) {
        return doc.map(item => filterDocument(item, dropDeleted, dropPropertyNames));
    }

    if (typeof doc.toJSON === 'function') {
        doc = doc.toJSON();
    }
    for (let i = dropPropertyNames.length - 1; i >= 0; i--) {
        delete doc[dropPropertyNames[i]];
    }

    for (const key in doc) {
        if (!doc.hasOwnProperty(key)) {
            continue;
        }
        const value = doc[key];
        if (dropDeleted) {
            if (Array.isArray(value)) {
                doc[key] = value.filter(item => item && !item.isDeleted).map(item => filterDocument(item, dropDeleted, dropPropertyNames));
            } else if (value instanceof Object) {
                if (value.isDeleted) {
                    delete doc[key]
                } else {
                    doc[key] = filterDocument(value, dropDeleted, dropPropertyNames);
                    delete doc[key].isDeleted;
                }
            }
        } else if (Array.isArray(value)) {
            doc[key] = value.map(item => filterDocument(item, dropDeleted, dropPropertyNames));
        } else if (value instanceof Object) {
            doc[key] = filterDocument(value, dropDeleted, dropPropertyNames);
        }
    }
    return doc;
}

/**
 * 执行bulk.execute方法，并将结果回调转为promise形式
 * @param bulk
 * @returns {Promise}
 */
global.gBulkExecutePromise = function gBulkExecutePromise(bulk) {
    return new Promise((resolve, reject) => {
        if (!bulk.length) {
            resolve();
        }
        bulk.execute((err, result) => {
            if (result && result.toJSON) {
                result = result.toJSON();
            }
            console.log(result);
            if (err) {
                reject(new MError(MError.ACESS_DATABASE_ERROR, err));
            } else if (result && result.ok !== 1) {
                reject(new MError(MError.ACESS_DATABASE_ERROR, 'update database failed!'));
            } else {
                resolve(result);
            }
        });
    })
        .catch(MError.prependCodeLine(true));
}

// 可通过console.log(__line)的形式获得当前代码行号字符串
Object.defineProperty(global, '__line', {
    get() {
        const pos = gGetCodePosition(1);
        return pos ? pos.line : '';
    }
});

const rootPath = `${path.sep}server`;
const rootPathIndex = __dirname.lastIndexOf(rootPath) + 1;
// 获得当前代码位置信息
global.gGetCodePosition = function gGetCodePosition(logStackDepth) {
    // Extract caller:
    const stack = new Error().stack;
    const callMsg = stack.split('\n')[logStackDepth + 2];
    if (callMsg) {
        const m = callMsg.match(/^\s+at\s*(.*?)\s+\(?([^ ]+?):(\d+):\d+\)?$/);
        if (m && m.length === 4) {
            const nodeExportsPathIndex = m[1].lastIndexOf('.exports.');
            if (nodeExportsPathIndex >= 0) {
                m[1] = m[1].substr(nodeExportsPathIndex + '.exports.'.length);
            }
            return {
                file: m[2].substr(rootPathIndex),
                line: m[3],
                method: m[1] ? m[1].replace(/^.*\[as ([^\]]+)].*$/, '$1').replace(/.+\.<anonymous>/, '') : ''
            }
        }
    }
    return {file: '', line: '', method: ''};
}

/**
 * 将查询参数转换为字符串，如果传了两个参数，可自动进行拼接
 * @param {string|object} paramsObj 对象形式的查询参数。其中的undefined属性会被过滤掉
 * @param {object,optional} url 待拼接的url。拼接时会检测其中是否已含有问号
 * @returns {string} 拼接好的url。若没填url参数则返回字符形式的查询参数
 */
global.gStringifyUrlParams = function gStringifyUrlParams(url, paramsObj) {
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
