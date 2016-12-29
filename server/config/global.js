const path = require('path');
const _ = require('underscore');

const isLocalMode = process.env.NODE_ENV !== 'production';
const forceDevMode = process.argv.indexOf('-dev') >= 0;
/**
 * 服务器端正式环境使用的配置。其它环境需要定义单独的文件覆盖这些配置
 */
const configure = {
    // 是否是测试环境
    dev: forceDevMode || isLocalMode,
    // 暴露给用户的主机名，包含端口号
    host: 'http://meetin.co:29862',
    // 端口号。服务器端需要用nginx转发到该端口。可能与nginx的端口号不一致
    port: 29860,
    // 服务器端环境
    is_server: !isLocalMode,
    // 工程根目录
    project_dir: path.normalize(`${__dirname}/../..`),
    // 可直接通过url访问的静态资源目录，包括html、图片、js等
    web_static_dir: path.normalize(`${__dirname}/../../public`),
    // 网站标题栏logo。可以为空
    favicon_path: path.normalize(`${__dirname}/../../public/static/favicon.ico`),
    // 后端用的数据和资源目录
    data_dir: path.normalize(`${__dirname}/../data`),
    // 生成文件的临时目录
    TMP_DIR: path.normalize(`${__dirname}/../data/tmp`),
    // 上传时的临时目录
    UPLOAD_TMP_DIR: path.normalize(`${__dirname}/../data/uploadtmp`),
    // 上传后的图片目录。这个本来是上传后用户可以直接访问的目录，可以放在static下，用户也能打开他所上传过的图片，进行选择或删除。但出于安全原因我们屏蔽了用户的操作接口，并将图片传至七牛，也就不需要放在static下了
    UPLOAD_IMAGE_BASE: path.normalize(`${__dirname}/../data/uploadimg`),
    // 编译打包时的临时目录
    COMPILE_TMP_DIR: path.normalize(`${__dirname}/../data/compiletmp`),
    // 模板目录
    render_dir: path.normalize(`${__dirname}/../../public/templates`),
    // 可嵌套在模板中的子模板目录
    partials_dir: path.normalize(`${__dirname}/../../public/templates/partials`),
    // 前端源码目录
    client_src_dir: path.normalize(`${__dirname}/../../client`),
    // 是否缓存模板文件编译结果
    enable_cache_complied_template: true,
    // 部署时的zip文件路径
    zipPath: path.normalize(`${__dirname}/../data/public_resource.zip`),
    // 文件编辑器上传图片大小限制，单位B
    editor_max_img_upload_size: 10 * 1024 * 1024,
    // 文件编辑器允许上传的图片格式
    editor_allow_img: ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
    // 最大请求大小，包括ajax和表单提交，不含上传文件
    max_request_size: '1mb',
    // 是否允许注册测试账号
    enable_test_account: false,
    // 向native服务器发包时用到的版本号。末尾的r表示正式包，d表示测试包
    packet_version_name: '10000-2016021334-r',
    // 日志重定向
    log4js_configure: {
        // 把日志输出到文件
        appenders: [
            {
                type: 'file',
                filename: '/log/meetin_admin/meetin_admin.log',
                maxLogSize: 128 * 1024,
                backups: 20,
                category: 'console',
                'alwaysIncludePattern': true,
                'pattern': '-yyyy-MM-dd-hh.log'
            }
        ],
        replaceConsole: true
    },
    mongo_db_address: 'mongodb://root:[ServerPassword]@dds-m5e410e6371755042.mongodb.rds.aliyuncs.com:3717,dds-m5e410e6371755041.mongodb.rds.aliyuncs.com:3717/meetin_admin?replicaSet=mgset-1614947',
    // 默认超时时间必须比网页端超时时间短
    default_packet_timeout: 30000,
};

if (!configure.is_server) {
    // eslint-disable-next-line global-require
    _.extend(configure, require('./global_local'));
}

if (configure.is_server) {
    // eslint-disable-next-line
    configure.mongo_db_address = configure.mongo_db_address.replace('[ServerPassword]', require(`${configure.project_dir}/db_config`).mongo.password);
}

module.exports = configure;
