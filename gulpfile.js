let gulp = require('gulp'),
    path = require('path'),
    Promise = require('bluebird'),
    del = require('del'),
    plugins = require('gulp-load-plugins')(),
    globalConfig = require('./server/config/global');

const pathConfig = {
    // html
    html: {
        input: 'client/view/**/*.html',
        output: 'public/templates'
    },
    // 浏览器标签logo
    favicon: {
        input: 'client/favicon.ico',
        output: 'public/static'
    },
}

// 默认编译配置，使用本地编译的参数
const gulpConfig = {
    branch: '', // 要提交到的分支名
    webpackConfigPath: null, // webpack配置文件路径。本地编译时不需要在gulp中运行webpack
};

// 设置服务器正式环境编译模式，生成的代码将被部署到服务器正式环境中
gulp.task('set-mode-server', (callback) => {
    gulpConfig.branch = 'master';
    gulpConfig.webpackConfigPath = './build/webpack.config.server';
    callback();
});

// 移动网站图标
gulp.task('move-favicon', () => {
    return gulp.src(pathConfig.favicon.input)
        .pipe(gulp.dest(pathConfig.favicon.output))
});

// 移动页面资源
gulp.task('move-html', () => {
    return gulp.src(pathConfig.html.input)
        .pipe(gulp.dest(pathConfig.html.output))
});
// 移动一些不常改变的静态资源
gulp.task('move-asset', ['move-favicon', 'move-html']);

// 编译vue文件
gulp.task('webpack', (callback) => {
    // 本地编译时不需要在gulp中运行webpack
    if (!gulpConfig.webpackConfigPath) {
        callback();
        return;
    }
    const configs = require(gulpConfig.webpackConfigPath);
    Promise.map(configs, webpackPromise)
        .then(() => callback());
});

function webpackPromise(config) {
    return new Promise((resolve, reject) => {
        require('webpack')(config, (err, stats) => {
            if (err) {
                reject(err);
            }
            const statsStr = stats.toString({
                colors: true,
                modules: false,
                children: false,
                chunks: false,
                chunkModules: false
            });
            process.stdout.write(`${statsStr}\n`)
            resolve();
        })
    })
}

// 清除目录
gulp.task('clean', () => {
    return del([
        'public/',
    ])
});

// 压缩html
gulp.task('html', () => {
    return gulp.src(pathConfig.html.input)
    // 替换资源文件名
        .pipe(plugins.if(gulpConfig.md5, plugins.revReplace({manifest: gulp.src(pathConfig.revManifest.files)})))
        // 让html中的资源指向cdn
        .pipe(plugins.if(!!gulpConfig.cdnHost, plugins.replace(/\/static\//g, `${gulpConfig.cdnHost}/static/`)))
        .pipe(plugins.if(gulpConfig.showJsLoadFail, plugins.replace(/><\/script>/g, ' onerror="debugNotify.loadFailed(event)"></script>')))
        .pipe(gulp.dest(pathConfig.html.output))
        // 通知livereload刷新浏览器
        .pipe(plugins.if(gulpConfig.liveReload, plugins.livereload()));
});

// 打包编译出的文件，发布时用的
gulp.task('zip', () => {
    const inputZip = [`${globalConfig.web_static_dir}/**/*`, `!${globalConfig.web_static_dir}/static/lib/**/*`];
    const zipDir = path.dirname(globalConfig.zipPath);
    const zipName = path.basename(globalConfig.zipPath);
    return gulp.src(inputZip)
        .pipe(plugins.zip(zipName))
        .pipe(gulp.dest(zipDir));
});

// git commit
gulp.task('commit', () => {
    return gulp.src('')
        .pipe(plugins.git.add())
        .pipe(plugins.git.commit('[gulp publish]', {
            emitData: true
        })).on('data', (data) => {
            console.log(data);
        });
});

// git pull
gulp.task('pull', (callback) => {
    plugins.git.pull('origin', gulpConfig.branch, callback);
});

// git push
gulp.task('push', (callback) => {
    plugins.git.push('origin', gulpConfig.branch, callback);
});

// 清空+编译+日志输出
gulp.task('compile', ['webpack', 'move-asset']);

// 生成正式环境用的资源包
gulp.task('compile-for-server', plugins.sequence(['set-mode-server', 'clean'], 'compile', 'zip', 'clean'));

// 生成正式环境用的资源包，并提交git
gulp.task('publish-master', plugins.sequence('compile-for-server', 'commit', 'pull', 'push'));

// 设置默认任务
gulp.task('default', plugins.sequence('clean', 'compile'));