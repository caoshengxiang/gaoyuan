/**
 * Created by gukong on 16/3/11.
 */

const assert = require('assert');
const Promise = require('bluebird');
const gm = require('gm').subClass({
    imageMagick: true
});

exports.IMAGE_160 = '160';
exports.IMAGE_300 = '300';
exports.IMAGE_640 = '640';

/**
 * 自动旋转并裁剪图片
 * @param {string} path
 * @param {Array} widths
 * @return {Promise}
 */
exports.cropImage = (path, widths) => {
    assert(Array.isArray(widths), '第二个参数应该是一个Array');

    return autoOrientImageToSave(path)
        .then((autoOrientResult) => {
            return Promise.map(widths, width => cropImageToSave(autoOrientResult.filePath, width))
                .then(results => [autoOrientResult, ...results]);
        });
};

function autoOrientImageToSave(imagePath) {
    return new Promise((resolve, reject) => {
        const prePath = imagePath.substr(0, imagePath.length - 4);
        const outputPath = `${prePath}_orient.jpg`;

        gm(imagePath).autoOrient()
            .noProfile()
            // .quality(50)
            .write(outputPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({filePath: outputPath, thumb: ''});
                }
            });
    });
}

function cropImageToSave(imagePath, width) {
    return new Promise((resolve, reject) => {
        const prePath = imagePath.substr(0, imagePath.length - 4);
        const outputPath = `${prePath}_${width}.jpg`;

        gm(imagePath).autoOrient()
            .noProfile()
            .resize(width)
            .quality(50)
            .write(outputPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({filePath: outputPath, thumb: width});
                }
            });
        //
        // im.resize({
        //     srcData: fs.readFileSync(imagePath, 'binary'),
        //     width: width,
        //     quality: 0.5
        // }, function(err, stdout, stderr) {
        //     fs.writeFileSync(outputPath, stdout, 'binary');
        //     if (!err) {
        //         callback(null, {filePath: outputPath, thumb: width.toString()});
        //     } else {
        //         callback(err);
        //     }
        // });
    });
}
