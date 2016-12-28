// noinspection JSUnusedGlobalSymbols

/* global window */

(function scopeWrapper(exportFunc) {
    const DEFUALT_MESSAGE = '网络错误，请重试';
    const errorCode = {};
    const codeInfoMap = [];

    /**
     * 定义一个错误码
     * @param {number} code 错误码，必须唯一
     * @param {null | string, optional} message 错误描述，会下发给浏览器端让用户看见。若不填则使用默认值。
     *                                   通过特殊标志${1}或${2}等，配合MError的setMessageTemplateData方法可以嵌入变量
     * @param {boolean, optional} fatal 是否是致命错误，默认为true。致命错误在测试环境会显示大红条提示
     * @return {number}
     */
    function defineCode(code, message, fatal) {
        if (codeInfoMap[code]) {
            throw new Error(`重复的错误码:${code}`);
        }
        codeInfoMap[code] = {
            message: message || `(${code})${DEFUALT_MESSAGE}`,
            fatal: fatal === undefined || fatal
        };
        return code;
    }

    /**
     * 获取错误码对应的错误信息
     * @param {number} code
     * @returns {{message: string, fatal: boolean}}
     */
    errorCode.getCodeData = function getCodeData(code) {
        if (codeInfoMap[code]) {
            return codeInfoMap[code];
        }
        console.error(`未知的错误码:${code}`);
        return {
            message: DEFUALT_MESSAGE,
            fatal: true
        };
    };

    /* eslint-disable no-template-curly-in-string */
    /** 无错误 */
    errorCode.SUCCESS = defineCode(0, '');

    /** 不知名错误 */
    errorCode.UNKNOWN = defineCode(1, '未知错误');

    /** **********************************以下前端相关的错误码*********************************** */

    /** 前端Ajax请求网络错误 */
    errorCode.AJAX_NETWORK_ERR = defineCode(1001);

    /** 前端Ajax请求超时 */
    errorCode.AJAX_TIME_OUT = defineCode(1002);

    /** 微信支付错误 */
    errorCode.WECHAT_PAY_ERROR = defineCode(1003, '微信支付遇到问题，请重新支付');

    /** **********************************以下发包相关的错误码*********************************** */

    /** 域名被墙 */
    errorCode.HOST_UNRESOLVED = defineCode(2001);

    /** 还未连接上 */
    errorCode.NOT_CONNECTED = defineCode(2002);

    /** 服务器断开连接 */
    errorCode.SERVER_CLOSED = defineCode(2003);

    /** 发包超时 */
    errorCode.TIME_OUT = defineCode(2004, '网络超时，请重试');

    /** 已达到最大重发次数 */
    errorCode.MAX_RETRY = defineCode(2005);

    /** 解析包错误 */
    errorCode.PARSE_ERROR = defineCode(2006);

    /** 无法创建请求包 */
    errorCode.PACKET_ERROR = defineCode(2008);

    /** 指定的地址在远程机器上不可用 */
    errorCode.ADDRESS_NOT_AVAILABLE = defineCode(2009);

    /** socket连接尝试超时 */
    errorCode.CONNCTION_TIMEDOUT = defineCode(2010);

    /** 服务器主动拒绝建立连接 */
    errorCode.CONNCTION_REFUSED = defineCode(2011);

    /** 连接已被重置 */
    errorCode.CONNCTION_RESET = defineCode(2012);

    /** 从本机到给定addr的网络不通 */
    errorCode.NETWORK_UNREACHABLE = defineCode(2013);

    /** socket 已经连接 */
    errorCode.IS_CONNECTED = defineCode(2014);

    /** 端口号被占用 */
    errorCode.ADDRESS_IN_USE = defineCode(2015);

    /** socket 发送数据返回错误 */
    errorCode.SOCKET_SEND_ERROR = defineCode(2016);

    /** 参数错误 */
    errorCode.PARAMETER_ERROR = defineCode(2017, '参数错误');

    /** 服务器操作数据时返回错误 */
    errorCode.SERVER_PROCESSCE_ERROR = defineCode(2018);

    /** 服务器返回数据为空 */
    errorCode.SERVER_RETURN_EMPTY_DATA = defineCode(2019);

    /** 不允许把数据库中查出的数据直接下发到浏览器 */
    errorCode.CANNOT_SEND_NATIVE_DATA = defineCode(2020);

    /** 请求包过大 */
    errorCode.REQUEST_TOO_LARGE = defineCode(2021, '数据量过大，发送失败');


    /** **********************************以下是各业务用的错误码*********************************** */
    /** 未登录，请求中没有找到自己的sessionKey */
    errorCode.NOT_SIGNIN = defineCode(3001, '未登录，请登录后再试', false);

    /** 登录态已过期，需要重新登录 */
    errorCode.NEED_RELOGIN = defineCode(3002, '登录态已过期，请重新登录后再试', false);

    /** 登录回包中没有返回openId */
    errorCode.LOGIN_NO_OPENID = defineCode(3003, '登录失败，请重试');

    /** 登录回包中没有返回sessionKey */
    errorCode.LOGIN_NO_SESSION_KEY = defineCode(3004, '登录失败，请重试');

    /** 注册时发现手机号已注册 */
    errorCode.SIGNUP_PHONE_EXIST = defineCode(3005, '该手机号已注册', false);

    /** 服务器端返回的账号或密码错误 */
    errorCode.SIGNIN_FAIL = defineCode(3006, '账号或密码错误', false);

    /** 账号格式错误 */
    errorCode.SIGNIN_PHONE_INVALID = defineCode(3007, '账号填写错误', false);

    /** 密码格式错误 */
    errorCode.SIGNIN_PASSWORD_INVALID = defineCode(3008, '密码填写错误', false);

    /** 验证码没填 */
    errorCode.SIGNUP_VERIFY_CODE_INVALID = defineCode(3009, '验证码填写错误');

    /** 七牛上传时返回错误 */
    errorCode.QINIU_UPLOAD_ERROR = defineCode(3013);

    /** 加载七牛上的资源时网络错误 */
    errorCode.QINIU_DOWNLOAD_ERROR = defineCode(3014);

    /** 数据库访问错误 */
    errorCode.ACESS_DATABASE_ERROR = defineCode(3018, '数据库访问错误');

    /** 下载文件错误 */
    errorCode.DOWNLOAD_FILE_ERROR = defineCode(3024, '下载错误');

    /** 数据库还未建立连接 */
    errorCode.DATABASE_CONNECTION_NOT_EXIST = defineCode(3026);

    /** 创建openId时出错 */
    errorCode.CREATE_OPENID_ERROR = defineCode(3027);

    /** 用户不存在 */
    errorCode.USER_NOT_EXIST = defineCode(3032, '用户不存在');

    /** 从数据库中查到了出乎意料的数据 */
    errorCode.UNEXPECTED_DB_DATA = defineCode(3034);

    /** 查询数据库返回空 */
    errorCode.FIND_NOTHING_IN_DB = defineCode(3037, '该${1}不存在');

    /** 数据不存在或已删除，无法修改 */
    errorCode.CANNOT_MODIFY_DELETED_DATA = defineCode(3038, '${1}已删除，无法修改');

    /** 没有微信openid */
    errorCode.NO_WX_OPENID = defineCode(3043, '请在微信中打开该网页');

    /** 手机号格式错误 */
    errorCode.INVALID_PHONE = defineCode(3044, '手机号格式错误');

    /** 数据库中的数据要调用gFilterDocument后再下发到浏览器 */
    errorCode.CANNOT_SEND_NATIVE_DATA = defineCode(3046, null, false);

    /** 数据库任务队列超时，可能某个任务忘记了回调 */
    errorCode.DB_TASK_QUEUE_TIME_OUT = defineCode(3047);

    /** node向其它服务器发送post请求失败 */
    errorCode.NODE_POST_ERROR = defineCode(2062);

    /** 获取token错误 */
    errorCode.GET_ACCESS_TOKEN = defineCode(2063, '获取token错误', false);


    /* eslint-ensable no-template-curly-in-string */
    exportFunc('errorCode', errorCode);
}(function exportFuncImpl(exportName, exportObj) {
    /* eslint-disable no-undef */
    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = exportObj;
    } else if (typeof define === 'function' && (define.amd || define.cmd)) {
        define(() => exportObj);
    } else {
        this[exportName] = exportObj;
    }
    /* eslint-enable no-undef */
}.bind(this || (typeof window !== 'undefined' ? window : global))));
