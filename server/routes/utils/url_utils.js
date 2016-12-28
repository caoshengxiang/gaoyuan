/**
 * Created by Carlos on 2016/11/26.
 */

/**
 * 返回originUrl上node节点的值（只能包含字符、数字、下划线）
 * @param node
 * @param originUrl
 * @returns {null}
 */
exports.getUrlParam = (node, originUrl) => {
    const pattern = new RegExp(`${node}=(\\w*)`, 'g');
    const matches = pattern.exec(originUrl);
    return (matches && matches[1]) ? matches[1] : null;
}

/**
 * 删除originUrl上所有的node节点
 * @param {[string]} nodes
 * @param {string} originUrl
 * @returns {string}
 */
exports.deleteUrlParam = (nodes, originUrl) => {
    let tempOriginUrl = originUrl;
    if (!nodes || !Array.isArray(nodes) || !tempOriginUrl) {
        console.error('carlos error, ', `nodes=${nodes}, originUrl=${tempOriginUrl}`);
    }
    nodes.forEach((item) => {
        const pattern = new RegExp(`(${item}=\\w*(&|$))`, 'g');
        tempOriginUrl = tempOriginUrl.replace(pattern, '');
    })
    if (tempOriginUrl.indexOf('=') <= 0) {
        tempOriginUrl = tempOriginUrl.replace('?', '');
    }
    return tempOriginUrl;
}
