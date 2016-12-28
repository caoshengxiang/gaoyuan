/**
 * Created by gukong on 16/5/21.
 */
const Promise = require('bluebird');
const profileDb = require('../profile/db/profile_model');
const signTask = require('./subtask');
const profileTask = require('../profile/subtask');

/** *************************************************************** */
exports.signIn = function(phone, pwd, res) {
    if (!phone || !require('./../utils/validation').isPhoneNum(phone)) {
        return Promise.reject(new MError(MError.SIGNIN_PHONE_INVALID, 'signin->手机号格式不对'));
    }
    if (!pwd) {
        return Promise.reject(new MError(MError.SIGNIN_PASSWORD_INVALID, 'signin->密码格式不对'));
    }

    return profileDb.findProfileByPhone(phone, profileDb.PROFILE_SRC.SIGN_UP)
        .then(profileDoc => signTask.signIn(profileDoc, pwd, phone))
        .then(result => signHandler(result, res))
        .catch((error) => {
            require('./authenticator').clearCookie(res);
            throw error;
        });
}

exports.signUp = function(phone, verifyCode, pwd, name, res) {
    if (!phone || !require('./../utils/validation').isPhoneNum(phone)) {
        return Promise.reject(new MError(MError.SIGNIN_PHONE_INVALID, 'signup->手机号格式不对'));
    }
    if (!pwd) {
        return Promise.reject(new MError(MError.SIGNIN_PASSWORD_INVALID, 'signup->密码格式不对'));
    }
    if (!name) {
        return Promise.reject(new MError(MError.SIGNUP_SOMETHING_INVALID, 'signup->名字不对'));
    }
    const properties = {
        name,
        pwd,
        sessionKey: signTask.createSessionKey()
    }
    return profileTask.createProfile(phone, properties)
        .then(profileDb.saveNewProfile)
        .then((doc) => {
            doc.currentSessionKey = doc.sessionKey[0].key;
            return doc;
        })
        .then(result => signHandler(result, res))
}

exports.signOut = function(openId, sessionKey, res) {
    return profileDb.delSessionKey(sessionKey, openId)
        .then(() => require('./authenticator').clearCookie(res));
}

function signHandler(result, res) {
    if (!result.profileOpenId) {
        return Promise.reject(new MError(MError.LOGIN_NO_OPENID, 'no profileOpenId'));
    } else if (!result.currentSessionKey) {
        return Promise.reject(new MError(MError.LOGIN_NO_SESSION_KEY, 'no currentSessionKey'));
    }

    console.log('new sessionkey:', result.currentSessionKey, 'new openid:', result.profileOpenId);

    const cookieOptions = {maxAge: 2592000000, httpOnly: true};
    res.cookie('meetin_ui', result.profileOpenId, cookieOptions);
    res.cookie('meetin_sk', result.currentSessionKey, cookieOptions);
    res.cookie('meetin_hu', result.avatar, cookieOptions);
    res.cookie('meetin_nm', result.name, cookieOptions);
    return Promise.resolve({});
}
