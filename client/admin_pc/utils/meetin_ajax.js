/**
 * Created by lnk on 2016/4/19.
 */
import $ from 'jquery';
import errorCode from 'common/error_code';
import debugNotify from './debug_notify';

const meetinAjax = {};
// 后端默认超时时间必须比这里短
const DEFAULT_TIME_OUT = 35000;
// 上传文件的默认超时时间
const DEFAULT_UPLOAD_TIME_OUT = 50000;

/**
 * 通过post发送数据，使后端直接收到json格式的数据。并统一处理常见的错误
 * @param {string} url
 * @param {object} data
 * @param {int,optional} timeout 超时时间，默认10秒
 * @return {Promise} 返回一个promise对象。其中done方法传递回包中的data数据；fail事件则传递整个回包，其中会包含一个status{code:123,message:'xxx'}对象
 */
meetinAjax.postJson = function postJson(url, data, timeout) {
    const config = {
        url,
        type: 'POST',
        data: JSON.stringify(data),
        // 在header中加上 accept 'application/json'
        dataType: 'json',
        contentType: 'application/json'
    };
    return commonAjax(config, timeout || DEFAULT_TIME_OUT);
};

/**
 * 通过表单发送同步的post请求，服务器端可以在回包时重定向或下发文件
 * @param {string} url
 * @param {object} data 要发送数据的键值对，值不可以是对象，必须序列化成字符串
 */
meetinAjax.postJsonSync = function postJsonSync(url, data) {
    const form = $('<form></form>');
    for (const name in data) {
        if (data.hasOwnProperty(name)) {
            const inputHead = $("<input type='hidden'/>").attr('name', name).val(data[name]);
            form.append(inputHead);
        }
    }
    form.attr({
        'action': url,
        'method': 'post',
        'target': '_self',
        'enctype': 'application/json'
    })
        .hide()
        .appendTo('body')
        .submit();
};

/**
 * 通过表单post上传文件并接收json格式的数据。并统一处理常见的错误
 * @param {string} url
 * @param {object} formElem form元素，其中需要含有一个选择文件的input元素
 * @param {int,optional} timeout 超时时间，默认10秒
 * @return {Promise} 返回一个promise对象。其中done方法传递回包中的data数据；fail事件则传递整个回包，其中会包含一个status{code:123,message:'xxx'}对象
 */
meetinAjax.uploadFile = function uploadFile(url, formElem, timeout) {
    $(formElem).attr('enctype', 'multipart/form-data');
    const config = {
        url,
        type: 'POST',
        cache: false, // 上传文件不需要缓存
        data: new FormData(formElem),
        processData: false, // 不对数据进行处理
        contentType: false, // 已经在表单处申明
        dataType: 'json'
    };
    return commonAjax(config, timeout || DEFAULT_UPLOAD_TIME_OUT);
};

/**
 * 通过get发送并接收json格式的数据（get发的本来就是json格式）。并统一处理常见的错误
 * @param {string} url
 * @param {object,optional} data
 * @param {int,optional} timeout 超时时间，默认10秒
 * @return {Promise} 返回一个promise对象。其中done方法传递回包中的data数据；fail事件则传递整个回包，其中会包含一个status{code:123,message:'xxx'}对象
 */
meetinAjax.get = function get(url, data, timeout) {
    const config = {
        url,
        type: 'GET',
        data,
        dataType: 'json'
    };
    return commonAjax(config, timeout || DEFAULT_TIME_OUT);
};

/**
 * 通用的发包和回包处理逻辑。会将ajax的done事件中返回了错误码的情况通过fail返回出来，并会将ajax的fail事件返回数据封装成{status{code:-1,message:'xxx'}}的形式
 * @param config
 * @param {int,optional} timeout 超时时间
 * @return {Promise} 返回一个promise对象。其中done方法传递回包中的data数据；fail事件则传递整个回包，其中会包含一个status{code:123,message:'xxx'}对象
 */
function commonAjax(config, timeout) {
    return new Promise((resolve, reject) => {
        let timer = setTimeout(() => {
            console.error(`load ${config.url} timeout`);
            timer = undefined;
            reject({
                data: null,
                status: {
                    code: errorCode.AJAX_TIME_OUT,
                    message: '网络超时，请重试',
                    debugMessage: 'node后端没有回包'
                }
            });
        }, timeout);

        // IE浏览器默认缓存ajax请求，这里禁用掉它
        config.cache = false;
        $.ajax(config)
            .done((result) => {
                if (typeof timer === 'undefined') {
                    return;
                }
                clearTimeout(timer);
                timer = undefined;

                if (result.status && result.status.code) {
                    // 登录态失效的统一处理逻辑
                    if (result.status.code === errorCode.NOT_SIGNIN || result.status.code === errorCode.NEED_RELOGIN) {
                        location.href = '/sign/signin.html';
                    } else {
                        onError(result);
                    }
                }
                resolve(result.data);
            })
            .fail((xhr, textStatus, textError) => {
                if (typeof timer === 'undefined') {
                    return;
                }
                clearTimeout(timer);
                timer = undefined;

                if (xhr.responseJSON && xhr.responseJSON.status) {
                    onError(xhr.responseJSON);
                } else {
                    onError({
                        data: null,
                        status: {
                            code: errorCode.AJAX_NETWORK_ERR,
                            message: '网络错误，请重试',
                            debugMessage: textError
                        }
                    });
                }
            });

        function onError(result) {
            if (window.devEnv) {
                debugNotify.showAjaxError(result.status);
            } else {
                console.error(result.status.message);
            }

            const err = new Error(result.message);
            err.data = result.data;
            err.status = result.status;
            // 必须reject一个Error对象，否则vuex要报warning
            reject(err);
        }
    });
}

export default meetinAjax;
