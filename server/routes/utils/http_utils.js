/**
 * Created by gukong on 16/7/16.
 */


const http = require('http');
const https = require('https');
const request = require('request');

/**
 * 发送异步请求，注意返回的是Buffer，如果需要当字符串使用还需要调用toString()方法
 * @param url
 * @returns {Promise|Promise<T>}
 */
function requestAsync(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            res.on('data', (chunk) => {
                resolve(chunk);
            });
        })
            .on('error', (err) => {
                reject(new MError(MError.BAIDU_GEOCODER_ERROR, err));
            });
    });
}

function requestAsyncHttps(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res_) => {
            res_.on('data', (data) => {
                resolve(JSON.parse(data));
            })
        }).on('error', (e) => {
            reject(e);
        });
    });
}

function postAsync(url, data) {
    return new Promise((resolve, reject) => {
        request({
            url,
            method: 'POST',
            json: data
        }, (error, response, body) => {
            console.log('nate-log postAsync error:', error);
            console.log(`nate-log postAsync body:${JSON.stringify(body)}`);
            if (error) {
                reject(new MError(MError.NODE_POST_ERROR, error));
            } else {
                resolve(body);
            }
        });
    });
}

exports.requestAsync = requestAsync;
exports.requestAsyncHttps = requestAsyncHttps;
exports.postAsync = postAsync;
