/**
 * Created by lnk on 2016/7/23.
 */


const path = require('path');
const decompress = require('decompress');
const config = require('./config/global');
const fse = require('fs-extra');

// 删除旧的public目录
fse.removeSync(path.normalize(`${config.project_dir}/public`));

// 解压开发环境打包好的public资源
decompress(config.zipPath, config.web_static_dir)
    .then(() => {
        console.log('public资源解压完成！');
    });
