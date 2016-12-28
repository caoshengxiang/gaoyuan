/**
 * Created by gukong on 16/5/21.
 */
const express = require('express');
const router = express.Router();
const manager = require('./manager');

router.get('/signin.html', (req, res) => {
    res.render('sign/signin.html', {
        applyFormOpenId: gConfig.home_page_apply_form_openid
    });
});

router.get('/signin', (req, res, next) => {
    const phoneNum = req.query.phoneNum;
    const pwd = req.query.password;
    manager.signIn(phoneNum, pwd, res).thenSend(req, res, next);
});

router.get('/signup', (req, res, next) => {
    const phoneNum = req.query.phoneNum;
    const verifyCode = req.query.verificationCode;
    const pwd = req.query.password;
    const name = req.query.name;
    manager.signUp(phoneNum, verifyCode, pwd, name, res).thenSend(req, res, next);
});

router.get('/signout', (req, res, next) => {
    const openId = req.cookies.meetin_ui;
    const sessionKey = req.cookies.meetin_sk;
    manager.signOut(openId, sessionKey, res)
        .catch(error => console.warn('ignore sign out error', error))
        .then(() => res.redirect('/sign/signin.html'));
});

exports.router = router;
