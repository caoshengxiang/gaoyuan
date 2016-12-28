const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const Promise = require('bluebird');
const snowflake = require('node-snowflake');
const crypto = require('crypto');

Promise.promisifyAll(fs);
Promise.promisifyAll(fse);

/**
 * 检查并创建当前目录和它的所有父级目录
 * @param  {string}   dirPath  文件路径
 * @return {Promise} 成功回调参数为dirPath
 */
exports.mkdirs = (dirPath) => {
    return new Promise((resolve, reject) => {
        fse.mkdirs(dirPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(dirPath);
            }
        });
    });
};

/**
 * 检查并创建所有父级目录
 * @param  {string}   dirPath  文件路径，会将它的父目录全部创建出来
 * @return {Promise} 成功回调参数为dirPath
 */
exports.mkParentDirs = (dirPath) => {
    return exports.mkdirs(path.dirname(dirPath));
};

/**
 * 判断文件是否存在。fs中的exists方法使用了非标准的回调参数，导致无法自动promisify。所以这里手动创建一个
 * @param  {string}   filePath  文件路径
 * @return {Promise} 成功回调参数为是否存在
 */
exports.exists = (filePath) => {
    return new Promise((resolve) => {
        fs.exists(filePath, resolve);
    });
};

/**
 * 移动文件
 * @param  {string}   srcPath  源文件路径
 * @param  {string}   dstPath  目标文件路径
 * @param  {boolean}  cover  是否覆盖同名文件，若不覆盖，则会将源文件删掉
 * @return {Promise} 成功回调参数为空
 */
exports.move = (srcPath, dstPath, cover) => {
    console.log('start move', srcPath, dstPath);
    return exports.exists(dstPath)
        .then((exist) => {
            if (exist && !cover) {
                return fs.unlinkAsync(srcPath);
            } else {
                return exports.mkdirs(dstPath)
                    .then(() => {
                        fse.moveAsync(srcPath, dstPath, {clobber: cover})
                    });
            }
        });
};

/**
 * 加载指定json文件
 * @param  {string}   filePath   文件名
 * @return {Promise} 成功回调参数为文件内容json对象
 */
exports.loadJsonFile = (filePath) => {
    return exports.exists(filePath)
        .then((exist) => {
            if (!exist) {
                console.warn(`json file ${filePath} is not exist`);
                return null;
            } else {
                // 不用require主要是为了解决路径问题。require和fs中用的路径不一致，提示找不到
                return fs.readFileAsync(filePath, 'utf-8')
                    .then(JSON.parse)
                    .catch(MError.prependCodeLine());
            }
        });
};

/**
 * 读取文件内容并计算md5
 * @param {string} filePath 要读取的文件路径
 * @return {Promise}
 */
exports.md5ByPath = (filePath) => {
    return fs.readFileAsync(filePath)
        .then(exports.md5Sync);
};

/**
 * 读取文件内容并计算md5
 * @param {string} filePath 要读取的文件路径
 * @return {string} md5字符串
 */
exports.md5ByPathSync = (filePath) => {
    return exports.md5Sync(fs.readFileSync(filePath));
};

/**
 * 同步地计算md5
 * @param data 要计算的内容
 */
exports.md5Sync = (data) => {
    return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * 创建一个临时文件用的路径
 * @return {string}
 */
exports.createTmpFilePath = () => {
    return path.join(gConfig.TMP_DIR, snowflake.Snowflake.nextId());
};

/**
 * 创建一个上传文件时用的临时文件路径
 * @return {string}
 */
exports.createUploadTmpFilePath = () => {
    return path.join(gConfig.UPLOAD_TMP_DIR, snowflake.Snowflake.nextId());
};
