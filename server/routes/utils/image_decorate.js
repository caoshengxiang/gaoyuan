/**
 * Created by Carlos on 2016/7/15.
 */
const fs = require('fs');
const Promise = require('bluebird');
const imageSize = require('image-size');
const gm = require('gm').subClass({
    imageMagick: true
});

/**
 * 获取折行后的字符串数组
 * @param {int} fontSize 字体大小
 * @param {string} text 文字内容
 * @param {int} maxWidth 一行最大宽度
 * @return {Array} 每行为一个字符串的字符串数组
 */
function getLineList(fontSize, text, maxWidth) {
    return autoLineFeed(fontSize, text, maxWidth);
}

/**
 * 将文字或图片合成到原图上
 * @param {string} src 原图路径
 * @param {string} out 输出路径
 * @param {Array} params 合成参数
 */
function constructImages(src, out, params) {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(src);
        const gmSrc = gm(readStream)
        params.forEach((item) => {
            switch (item.type) {
                case 'text': {
                    mergeTextToImage(gmSrc, item.content, item.color, item.size, item.maxWidth, item.fontPath, item.gravity, item.x, item.y);
                    break;
                }
                case 'imagePath': {
                    const excursionLocation = getExcursionLocation(src, item.path, item.gravity, item.width, item.height, item.x, item.y);
                    //eslint-disable-next-line
                    compositeImages(gmSrc, item.path, excursionLocation[0], excursionLocation[1], item.width, item.height, item.strokeWidth, item.strokeColor, item.replaceBlackColor);
                    break;
                }
                default: {
                    console.warn(`unknown type: ${item.type}`);
                }
            }
        })
        // gmSrc.write(out, function(err) {
        //     if (err) {
        //         reject(err);
        //     } else {
        //         resolve(out);
        //     }
        // });
        gmSrc.toBuffer('jpg', (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    })
}

/**
 * 根据gravity获取图片偏移量
 * @param src 原图路径
 * @param target 被合成图路径
 * @param gravity 被合成图重心，包括：NorthWest, North, NorthEast, West, Center, East, SouthWest, South, or SouthEast
 * @param {int} width 设置的图片宽度，0表示默认大小
 * @param {int} height 设置的图片高度，0表示默认大小
 * @param {int} x 图片X方向的相对偏移量
 * @param {int} y 图片Y方向的相对偏移量
 * @returns {number[]}
 */
function getExcursionLocation(src, target, gravity, width, height, x, y) {
    const srcDimensions = imageSize(src);
    const srcWidth = srcDimensions.width;
    const srcHeight = srcDimensions.height;
    const targetDimensions = imageSize(target);
    const targetWidth = width || targetDimensions.width;
    const targetHeight = height || targetDimensions.height;
    const excursion = [0, 0];
    switch (gravity.toLowerCase()) {
        case 'north':
            excursion[0] = ((srcWidth - targetWidth) / 2) | 0 + x;
            excursion[1] = 0 + y;
            break;
        case 'west':
            excursion[0] = 0 + x;
            excursion[1] = ((srcHeight - targetHeight) / 2) | 0 + y;
            break;
        case 'east':
            excursion[0] = srcWidth - targetWidth - x;
            excursion[1] = ((srcHeight - targetHeight) / 2) | 0 + y;
            break;
        case 'south':
            excursion[0] = ((srcWidth - targetWidth) / 2) | 0 + x;
            excursion[1] = srcHeight - targetHeight - y;
            break;
        case 'center':
            excursion[0] = ((srcWidth - targetWidth) / 2) | 0 + x;
            excursion[1] = ((srcHeight - targetHeight) / 2) | 0 + y;
            break;
        case 'northeast':
        case 'eastnorth':
            excursion[0] = srcWidth - targetWidth - x;
            excursion[1] = 0 + y;
            break;
        case 'southwest':
        case 'westsouth':
            excursion[0] = 0 + x;
            excursion[1] = srcHeight - targetHeight - y;
            break;
        case 'southeast':
        case 'eastsouth':
            excursion[0] = srcWidth - targetWidth - x;
            excursion[1] = srcHeight - targetHeight - y;
            break;
        default:
            excursion[0] = x;
            excursion[1] = y;
            break;
    }
    return excursion;
}

/**
 * 合成文字与图片, 注意：不可以交换配置项顺序，否则将出现错误
 * @param src 源图片
 * @param text 显示的文字
 * @param textColor 文字颜色
 * @param textSize 字体大小
 * @param maxWidth 单行文字的最大宽度
 * @param fontPath 字体格式文件路径, 如果是中文则必须传递包含中文的字体文件，否则会显示？？？
 * @param gravity 文字重心，包括：NorthWest, North, NorthEast, West, Center, East, SouthWest, South, or SouthEast
 * @param offsetX 相对于当前重心的X方向偏移量
 * @param offsetY 相对于当前重心的Y方向偏移量
 */
function mergeTextToImage(src, text, textColor, textSize, maxWidth, fontPath, gravity, offsetX, offsetY) {
    if (!text) {
        return;
    }

    if (textColor) {
        src.fill(textColor);
    }
    if (textSize) {
        src.fontSize(textSize);
    }
    if (fontPath) {
        src.font(fontPath);
    }
    const textToShow = autoLineFeed(textSize, text, maxWidth).join('\n');
    // 在图片上设置了描边后，文字上也会带有描边，所以这里需要清除。注意strokeWidth不能设为0
    src.stroke('#00000000');
    src.drawText(offsetX || 0, offsetY || 0, textToShow, gravity);
}

/**
 * 获取自动换行后的字符串
 * @param {int} fontSize 字体大小，可近似为字体高度
 * @param {string} text 显示的文本
 * @param {int} maxWidth 显示文本的最大宽度
 * @returns {*}
 */
function autoLineFeed(fontSize, text, maxWidth) {
    const fontWidth = fontSize / 2;
    const charactorsOneLine = maxWidth ? (maxWidth / fontWidth) | 0 : 0;
    let lineNum = 0;
    let count = 0;
    const lineTextArray = [];
    let showText = '';
    let word = '';
    let complete = false;
    let i = 0;
    while (i < text.length) {
        if (text.charCodeAt(i) > 127) {
            count += 2;
        } else {
            count++;
            word += text[i++];
            if (isEndOfEnglishWord(text, i)) {
                complete = true;
            }
        }
        if (count > charactorsOneLine && charactorsOneLine) {
            lineTextArray[lineNum++] = showText;
            count = 0;
            showText = '';
        } else if (complete) {
            showText += word;
            word = '';
            complete = false;
        } else if (text.charCodeAt(i) > 127) {
            showText += text[i++];
        }
    }
    if (showText) {
        lineTextArray[lineNum] = showText;
    }
    return lineTextArray;
}

/**
 * 判断是否到了一个单词的结尾
 * @param {string} text 需要判断的字符串
 * @param {int} nextIndex 当前位置的下一个下标
 */
function isEndOfEnglishWord(text, nextIndex) {
    const nextChar = text[nextIndex];
    const currentChar = text[nextIndex - 1];
    const re = /\w/;
    return !re.test(nextChar) || !re.test(currentChar) || nextIndex > (text.length - 1);
}

/**
 * 获取图片的实际显示宽高
 * @param {string} imagePath 图片路径
 * @param width 图片宽度，0表示默认宽度
 * @param height 图片高度，0表示默认高度
 * @returns {Array}
 */
function getImageDimension(imagePath, width, height) {
    const dimension = [width, height];
    if (!width || !height) {
        const srcDimensions = imageSize(imagePath);
        dimension[0] = width || srcDimensions.width;
        dimension[1] = height || srcDimensions.height;
    }
    return dimension;
}

/**
 * 合成图片
 * @param src 源图的gm对象
 * @param compositeImagePath 被合成图片的路径
 * @param offsetX 相对于当前重心的X方向偏移量
 * @param offsetY 相对于当前重心的Y方向偏移量
 * @param width 图片的宽度，0表示默认大小
 * @param height 图片的高度，0表示默认大小
 * @param strokeWidth 描边宽度。注意是沿边框描的，即边框内外各占一办宽度的描边
 * @param strokeColor 描边颜色
 * @param replaceBlackColor 底色。仅在要合成的图是黑白图时有效，可以将黑色改为想要的颜色
 */
function compositeImages(src, compositeImagePath, offsetX, offsetY, width, height, strokeWidth, strokeColor, replaceBlackColor) {
    if (!compositeImagePath) {
        return;
    }
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    width = width || 0;
    height = height || 0;
    const imageDimension = getImageDimension(compositeImagePath, width, height);
    if (strokeWidth && strokeColor) {
        src.fill('#00000000');
        src.stroke(strokeColor);
        src.strokeWidth(strokeWidth);
        src.drawRectangle(offsetX, offsetY, offsetX + imageDimension[0], offsetY + imageDimension[1]);
    }
    if (replaceBlackColor) {
        src.fill(replaceBlackColor);
        src.stroke('#00000000');
        src.drawRectangle(offsetX, offsetY, offsetX + imageDimension[0] - 1, offsetY + imageDimension[1] - 1);
    }
    const commands = [];
    commands.push(replaceBlackColor ? 'image Plus' : 'image Over');
    commands.push(`${offsetX}, ${offsetY}`);
    commands.push(`${width}, ${height}`);
    commands.push(`"${compositeImagePath}"`);
    // src.colorize(0, 255, 0)
    src.draw(commands.join(' '))
}

exports.constructImages = constructImages;
exports.getLineList = getLineList;
