/**
 * Created by Ardon on 2016/9/8.
 */
const mongoose = require('mongoose');

/**
 * 数据版本号，数据更新时需要更新版本号
 * @type {number}
 */
exports.DATA_VERSION = 1;

/**
 * 账号类型
 */
exports.ACCOUNT_TYPE = {
    /** 根用户，拥有最大权限 */
    ROOT: 1,
    /** 开发 */
    DEVELOPER: 2,
}

const accountSchema = new mongoose.Schema({
    // 索引用的id
    accountOpenId: {type: String, unique: true},
    // 登录用的账号
    account: {type: String, unique: true},
    // 密码2次md5的结果。前端一次，后端一次
    password: String,
    // 显示用的昵称
    nickName: String,
    // 头像地址
    avatar: String,
    // 账号类型，决定了权限
    type: Number,

    dataVersion: {type: Number, default: exports.DATA_VERSION} // 数据版本号
});
// 增加创建和修改日期字段
accountSchema.set('timestamps', true);

exports.accountSchema = accountSchema;
