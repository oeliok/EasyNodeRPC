/**
 * 负责管理服务公共部分
 */
let Path = require("path");
let { sendMessage } = require("../../lib/util");
let { dsfserver, rpcinterface, rpcservice } = require("../config/application.js");
let logger = require("../../lib/log");
let { initLocalService, getProviderServices } = require("./localService");
let { initRemoteService, getCustomerServices, initProvider } = require("./remoteService");

let SERVER_PORT = 0;
async function sendDSF(port) {
    let arr = dsfserver.split(":");
    let provider = getProviderServices();
    let customer = getCustomerServices();
    // 发送本应用提供的服务和需要消费的服务
    let { status, data } = await sendMessage(arr[0], arr[1], "/dsf/start", { port: port, custom: customer, provide: provider });
    logger.info("Regist to center : " + status);
    if (status) {
        // 根据返回的服务信息，设置本地的服务
        initProvider(data);
    }
}

/**
 * 初始化
 * @param {*} path 
 * @param {*} port 
 */
exports.initRpcService = async function (port = 0) {
    // 方便后续注册和注销使用
    SERVER_PORT = port;
    // rpc interface
    for (let i in rpcinterface) {
        initRemoteService(rpcinterface[i]);
    }
    // rpc service
    for (let i in rpcservice) {
        initLocalService(rpcservice[i]);
    }
    // 远程注册与本地
    sendDSF(SERVER_PORT).then(() => { }).catch((e) => { logger.error(e) });
}

/**
 * 关闭服务
 */
exports.stopRpcService = async function () {
    // 主要是主动向服务注册中心发送下线信息
    let arr = dsfserver.split(":");
    let { status } = sendMessage(arr[0], arr[1], "/dsf/stop", {});
    logger.info("Send stop message to registor: " + status);
}

/**
 * 定时发送心跳报文到注册中心
 * secendInterval 间隔时间，单位：秒
 */
let SERVER_FLAG = true;
let SERVER_VERSION = 0; // 为了解决掉线之后迅速启动
exports.sendHeartBeat = function (secendInterval = 3) {
    let arr = dsfserver.split(":");
    setInterval(async () => {
        let num = Math.floor(Math.random() * 100);
        try {
            let { status, data, version } = await sendMessage(arr[0], arr[1], "/dsf/hello", { num: num, port: SERVER_PORT });
            logger.info("Heart:", status, data, version, SERVER_VERSION, num, (num * 123 == data));
            // 如果能连到dsf中心，且之前失败过就重新注册到新的注册中心上面，或者服务器版本发生了变化
            if (SERVER_VERSION == 0) {
                // 第一次需要同步版本号
                SERVER_VERSION = version;
            } else {
                // 第N次（N>1）
                if (version == SERVER_VERSION) {
                    // 版本号相同
                    if (status == true && SERVER_FLAG == false) {
                        // 说明曾经有无法连接到注册中心，需要再次注册
                        await sendDSF(SERVER_PORT);
                        SERVER_FLAG = true;
                    } else {
                        // 正常情况
                    }
                } else {
                    // 版本号不同，需要重新注册
                    await sendDSF(SERVER_PORT);
                    SERVER_VERSION = version;
                }
            }
        } catch (e) {
            logger.error("DSF server is not access: " + e);
            // 调不同就需要等能调用的时候，重新注册了
            SERVER_FLAG = false;
        }
    }, secendInterval * 1000);
}

