/**
 * Created by lnk on 2016/7/22.
 */
import $ from 'jquery';
import errorCode from 'common/error_code';

const origConsoleError = console.error;
if (window.devEnv) {
    // 捕获未处理的异常
    window.onerror = function onerror(errorMessage, scriptURL, lineNumber) {
        errorMessage = (`${errorMessage}`).replace(/</g, '&lt;').replace(/\n/g, '<br>');
        notification('alert', `<span>${errorMessage}</span><span style="float:right; padding-right:10px; width: 100%; word-wrap: break-word; ">${scriptURL}:${lineNumber}</span>`);
    };

    // 把控制台的错误日志输出到大红条上
    console.error = (...args) => {
        origConsoleError(...args);
        const errorMessage = args.map(arg => `${arg}`.replace(/</g, '&lt;')).join('<br>').replace(/\n/g, '<br>');
        notification('alert', `<span>${errorMessage}</span>`);
    }
}

// 请求失败
function showAjaxError(status) {
    // 已经对用户进行展示或已经做了良好处理的错误。如登录失败重定向到登录页，提示登录密码错误等
    if (errorCode && !errorCode.getCodeData(status.code).fatal) {
        console.warn(status.message, status.debugMessage);
        // 不需要弹提示条
        return;
    }
    notification('alert', `<span class="ajax-code">${status.code}</span><span>${status.message}</span><br/><p class="ajax-stack">${status.debugMessage.replace(/\n/g, '<br>')}</p>`);
}

/**
 * 打印Error对象
 * @param {Error} error
 */
function showError(error) {
    origConsoleError(error);
    const stack = error.stack
        .split('\n')
        .slice(1, 5)
        .map(line => line.replace(/</g, '&#60;'))
        .join('<br>');
    notification('alert', `<span class="normal-error">${error.message}</span><br/><p class="normal-error-stack">${stack}</p>`);
}

/**
 * 打印普通日志
 * @param {string} msg
 * @param {number,optional} duration 提示条显示的时间
 */
function showInfo(msg, duration) {
    console.log(msg);
    notification('info', `<p class="info">${msg.replace(/</g, '&#60;').replace(/\n/g, '<br>')}</p>`, duration);
}

/**
 * 打印普通日志，一定时间后消失
 * @param {string} msg
 */
function toast(msg) {
    showInfo(`${msg}`, 2000);
}

// 加载资源失败
function loadFailed(event) {
    const src = event.target.src;
    const errInfo = new Error().stack.split('\n')[2];
    let errLine = '';
    if (errInfo) {
        const matches = errInfo.match(/^.*?\((.+?):(\d+)(:\d+)?\).*$/);
        if (matches.length > 1) {
            let url = matches[1], lineNum;
            if (matches.length > 2) {
                lineNum = matches[2];
                url += `:${lineNum}`;
            }
            console.warn(`load ${src} failed.\nat ${url}`)
            errLine = `<br>at html: ${lineNum}`;
        }
    }
    notification('alert', `load ${src} failed.${errLine}`);
}

/**
 * 弹出foundation样式的alert条
 * @param  {string} type     类型，取值为success,alert,warning,info,secondary
 * @param  {string} text     内容文字
 * @param  {number, optional} duration 显示多久后消失，不填表示不消失
 */
function notification(type, text, duration) {
    if (!window.devEnv) {
        return;
    }
    let $alertArea = $('#alert-area');
    if (!$alertArea.length) {
        init();
        $alertArea = $('<div id="alert-area"></div>');
        $('body').prepend($alertArea);
    }
    const $alert = $(`<div data-alert class="alert-box ${type}">${text}<span class="close">&times;</span></div>`);
    $alertArea.append($alert);
    $alert.find('.close').click(close);
    if (duration) {
        setTimeout(close, duration);
    }

    function close() {
        $alert.fadeOut(300, () => {
            $alert.remove();
        });
    }

    function init() {
        const alertCss = `
<style>
    .alert-box {
      display: block;
      font-size: 14px;
      font-weight: normal;
      float: left;
      width: 100%;
      word-break: break-all;
      margin-bottom: 5px;
      padding: 10px 40px 10px 18px;
      position: relative;
      transition: opacity 300ms ease-out;
      background-color: #008CBA;
      color: #FFF;
      box-sizing: border-box;
      border-width: 0;
      border-radius: 0
    }
    
    .alert-box .close {
      right: 0;
      top: 0;
      height: 100%;
      padding: 0 10px;
      background: rgba(255, 255, 255, 0.5);
      color: #333333;
      font-size: 32px;
      font-weight: normal;
      text-shadow: 0 0 0;
      opacity: 0.3;
      position: absolute;
      cursor: pointer;
    }
    
    .alert-box .close:hover {
      opacity: 0.6;
    }
    
    .alert-box.success {
      background-color: rgba(67, 172, 106, 0.8);
    }
    
    .alert-box.alert {
      background-color: rgba(240, 65, 36, 0.8);
    }
    
    .alert-box.secondary {
      background-color: rgba(231, 231, 231, 0.8);
      color: #4f4f4f;
    }
    
    .alert-box.warning {
      background-color: rgba(240, 138, 36, 0.8);
    }
    
    .alert-box.info {
      background-color: rgba(160, 211, 232, 0.8);
      color: #4f4f4f;
    }
    
    #alert-area {
      z-index: 1000000000;
      position: fixed;
      width: 100%;
      text-align: left;
    }

    .ajax-code {
      margin-right: 8px;
    }
    
    @media (min-width: 768px) {
      .ajax-code {
        float: left;
        height: 40px;
      }

      .ajax-stack {
        float: left;
        font-size: 150%;
      }
    }
</style>`;
        $('head').append(alertCss);
    }
}

export default {
    showInfo,
    showError,
    showAjaxError,
    loadFailed,
    toast,
};
