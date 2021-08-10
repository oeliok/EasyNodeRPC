/**
 * 负责与客户端交互的接口
 * 
 * 
 */
const logger = require("../../lib/log");
const { sendMessage } = require("../../lib/util");

// 发送心跳检查
exports.heartBeat = async function (server = "") {
    let arr = server.split(":");
    let param = { num: Math.floor(Math.random() * 100) };
    try {
        let { status, data } = await sendMessage(arr[0], arr[1], "/dsf/hello", param);
        if (status == true && data == (param.num * 123)) {
            return { status: true, code: 1 };
        } else {
            return { status: true, code: 0 };
        }
    } catch (e) {
        return { status: false, code: 0 };
    }
}

/**
 * 当服务节点变化，通知订阅节点
 * @param {*} server 
 * @param {*} param 
 * @returns 
 */
async function sendNotify(server = "", param = {}) {
    let arr = server.split(":");
    try {
        let { status } = await sendMessage(arr[0], arr[1], "/dsf/notify", param);
        console.log(status);
        return { status: true, code: 1 };
    } catch (e) {
        return { status: false, code: 0 };
    }
}

/**
 * 实现通知节点注销服务
 * @param {"ip+port":[""]} custnode 
 */
exports.foreachSendNotify = function (flag, custnode = {}, server = "") {
    // 根据ip汇总服务名称
    let node = {};
    for (let i in custnode) {
        let snl = custnode[i];
        for (let j in snl) {
            let sn = snl[j];
            if (node[sn]) {
                node[sn].push(i);
            } else {
                node[sn] = [i];
            }
        }
    }

    // 推送注册服务到订阅的服务器
    for (let i in node) {
        if (i != server) {
            let param = node[i];
            let info = { flag: flag, server: server, service: param };
            logger.info("Need sendNotify", i, info);
            sendNotify(i, info).then(() => { }).catch((e) => { logger.error(e) });
        } else {
            logger.info("Don't need sendNotify", i);
        }
    }
}

