/**
 * Created by lnk on 16/12/29.
 */
const express = require('express');
const router = express.Router();
// const manager = require('./manager');
const authenticator = require('./authenticator');

router.get('/signin', (req, res, next) => {
    const name = req.query.name;
    const password = req.query.password;
    authenticator.signIn(name, password, req.ip, res).thenSend(req, res, next);
});

router.get('/signup', (req, res, next) => {
    const name = req.query.name;
    const password = req.query.password;
    authenticator.signUp(name, password, req.ip, res).thenSend(req, res, next);
});

router.get('/signout', (req, res) => {
    const sessionKey = req.cookies.meetin_admin_sk;
    authenticator.signOut(sessionKey, res)
        .catch(error => console.warn('ignore sign out error', error))
        // TODO
        .then(() => res.redirect('/sign/signin.html'));
});

exports.router = router;
