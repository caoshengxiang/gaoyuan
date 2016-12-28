const listDir = require('list-dir');
const express = require('express');

const router = express.Router();

// 初始化router列表，根据请求路径，自动转发到对应的router.js文件中去
const routerList = [];
listDir.sync(__dirname).forEach((fileName) => {
    const matchs = fileName.match(/(.+)[\/\\]router\.js/);
    if (matchs) {
        routerList.push(`/${matchs[1].replace(/\\/g, '/')}`);
    }
});
routerList.map(url => router.use(url, require(`.${url}/router`).router))

module.exports = router;
