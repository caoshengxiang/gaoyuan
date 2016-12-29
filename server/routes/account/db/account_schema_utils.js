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
    /** 无任何权限者 */
    GUEST: 3,
}

const accountSchema = new mongoose.Schema({
    // 索引用的id
    accountOpenId: {type: String, unique: true},
    // 登录用的账号
    name: {type: String, unique: true},
    // 密码2次md5的结果。前端一次，后端一次
    password: String,
    // 显示用的昵称
    nickName: String,
    // 头像地址
    avatar: String,
    // 账号类型，决定了权限
    type: Number,
    // 登录态数组。用数组的形式是为了支持多端同时登录
    sessions: [{
        key: String,
        // 过期时间
        expireAt: Date,
        // 登录时的ip地址，目前仅做记录用
        ip: String,
        // session数据
        data: mongoose.Schema.Types.Mixed,
    }],

    dataVersion: {type: Number, default: exports.DATA_VERSION} // 数据版本号
});
// 增加创建和修改日期字段
accountSchema.set('timestamps', true);

exports.accountSchema = accountSchema;
