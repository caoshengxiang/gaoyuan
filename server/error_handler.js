/**
 * Created by Lnk on 2016/8/22.
 */

// 处理错误信息用的路由
exports.router = function router(err, req, res, next) {
    err = parseErrorInfo(err);

    console.error(req.path, err.debugMessage);
    console.error(err.stack);
    res.status(err.status);

    const resData = {
        status: {
            code: err.code,
            message: err.message
        }
    };
    if (err.data) {
        resData.data = err.data;
    }
    if (gConfig.dev && err.debugMessage) {
        resData.status.debugMessage = err.debugMessage;
    }
    if (res.locals.onlyAcceptJson) {
        res.send(resData)
    } else if (err.code === MError.NEED_RELOGIN || err.code === MError.NOT_SIGNIN) {
        res.redirect('/sign/signin.html');
    } else {
        res.render('error', resData);
    }
};

/**
 * 处理未捕获的异常
 * @param {MError} err
 */
exports.printUncaughtException = function printUncaughtException(err) {
    if (err instanceof MError) {
        console.error('未捕获的异常', err.debugMessage);
        console.error(err.stack);
    } else {
        console.error(err);
    }
}

/**
 * 处理process上监听到的warning
 * @param {MError} err
 */
exports.printProcessWarning = function printProcessWarning(err) {
    console.error(err);
}

/**
 * 处理未捕获的Promise.reject
 * @param {MError} err
 */
exports.printUnhandledRejection = function printUnhandledRejection(err) {
    if (err instanceof MError) {
        console.error('未捕获的Promise.reject', err.debugMessage);
        console.error(err.stack);
    } else {
        console.error(err);
    }
}

/**
 * 打印MError
 * @param {MError} err
 */
exports.printMError = function printMError(err) {
    console.error(err.debugMessage);
    console.error(err.stack);
}

/**
 * 解析错误信息，转换为MError对象
 * @param {Error} err 原生异常或业务中抛出的MError对象
 * @returns {MError}
 */
function parseErrorInfo(err) {
    let newError;
    if (err instanceof MError) {
        newError = err;
    } else {
        console.error('未处理的异常');
        console.error(err.stack || err);
        if (err.message === 'request entity too large') {
            newError = new MError(MError.REQUEST_TOO_LARGE, err);
        } else {
            newError = new MError(MError.UNKNOWN, err);
            newError.status = 500;
        }
    }
    return newError;
}
