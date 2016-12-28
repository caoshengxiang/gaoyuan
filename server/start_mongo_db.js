/**
 * Created by Carlos on 2016/8/3.
 */
const fse = require('fs-extra');
const path = require('path');
const moment = require('moment');
const childProcess = require('child_process');

const config = {
    // mongo数据库存放路径
    mongo_db_path: path.normalize(`${__dirname}/../mongo_db`),
    // mongo数据路log存放路径
    mongo_log_path: path.normalize(`${__dirname}/../mongo_db/mongo_log`),
    // 本地端口号
    mongo_port: 25916,
    // 日志文件名
    logFile: `${moment().format('YYYYMMDD_hhmmss')}.txt`
}

fse.mkdirs(config.mongo_log_path, (err) => {
    if (err) {
        console.error(`创建文件路径：${config.mongo_log_path} 失败\n`);
        console.error(err);
    } else {
        startMongoDB();
    }
});

function startMongoDB() {
    const mongodPath = process.env.MONGODB;
    if (!mongodPath) {
        console.error('需要配置环境变量:MONGODB');
        return;
    }
    childProcess.exec(`"${path.join(mongodPath, 'mongod.exe')}" --dbpath=${
            config.mongo_db_path} --logpath=${path.join(config.mongo_log_path, config.logFile)
            } -port ${config.mongo_port}`, (err, stdout, stderr) => {
        console.log(`err:${err}\nstdout${stdout}\nstderr${stderr}`);
    });
}
