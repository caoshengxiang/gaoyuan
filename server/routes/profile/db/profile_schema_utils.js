/**
 * Created by Ardon on 2016/9/8.
 */
const mongoose = require('mongoose');

/**
 * 数据版本号，数据更新时需要更新版本号
 * @type {number}
 */
exports.DATA_VERSION = 1;

const profileSchema = new mongoose.Schema({
    profileOpenId: String, // 是sponsorOpenId的超集
    loginId:String,
    name: String,
    avatar: String,
    password: String,

    dataVersion: {type: Number, default: exports.DATA_VERSION} // 数据版本号
});
// 增加创建和修改日期字段
profileSchema.set('timestamps', true);

exports.profileSchema = profileSchema;
