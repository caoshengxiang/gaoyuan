const express = require('express');
const fs = require('fs');
const path = require('path');
const listDir = require('list-dir');
const artTemplate = require('art-template');

const router = express.Router();

let renderList = [];

function init() {
    if (fs.existsSync(gConfig.render_dir)) {
        renderList = listDir.sync(gConfig.render_dir)
            .filter(fileName => /^([^.]+.html)$/.test(fileName))
            .map(fileName => fileName.replace(/\\/g, '/'));
    }
    console.log('renderList', JSON.stringify(renderList));
}

router.get('*', (req, res, next) => {
    const reqPath = req.path.endsWith('/') ? req.path.substr(0, req.path.length - 1) : req.path;
    // 资源文件不需要走模板渲染流程
    const ext = path.extname(reqPath);
    if (ext && (ext !== '.html' && ext !== '.htm')) {
        next();
        return;
    }
    // 去掉开头的/
    const renderPath = reqPath.substr(1);
    if (renderList.indexOf(renderPath) >= 0) {
        console.log('render path:', renderPath);
        res.render(renderPath);
    } else {
        next();
    }
});

exports.router = router;
exports.init = function(app) {
    // 配置模板引擎art-template
    app.engine('html', artTemplate.__express);
    // 可通过res.render渲染的文件目录。设置后就不能再设置artTemplate的base了
    app.set('views', gConfig.render_dir);
    // 通过res.render渲染时的默认文件后缀名
    app.set('view engine', 'html');
    // 设置标签语法，以免与前端的vue冲突
    artTemplate.config('openTag', '[[');
    artTemplate.config('closeTag', ']]');
    // 测试环境不缓存编译结果，方便调试
    artTemplate.config('cache', gConfig.enable_cache_complied_template);
    // 加载模板文件列表
    init();
};

/**
 * 直接渲染并输出html字符串的方法。
 * 由于不能设置base。所以渲染的根路径就是工程根目录。并且渲染时不能带html。用法如下：
 * require('./render').render('./public/templates/index', data)
 */
exports.render = artTemplate;
