/**
 * 负责管理服务公共部分
 */
let Path = require("path");
let { sendMessage } = require("../../lib/util");
let { dsfserver } = require("../config/application.json");
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
    SERVER_PORT = port;
    // 初始化本地能提供的服务
    initLocalService(Path.resolve(__dirname + "/../rpc/service"));
    // 初始化本地需要消费的服务
    initRemoteService(Path.resolve(__dirname + "/../rpc/interface"));
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
            logger.info("Heart:", status, num, data, (num * 123 == data));
            // 如果能连到dsf中心，且之前失败过就重新注册到新的注册中心上面
            if ((version != SERVER_VERSION && SERVER_VERSION != 0) || (status == true && SERVER_FLAG == false)) {
                // 远程注册与本地
                sendDSF(SERVER_PORT).then(() => { }).catch((e) => { logger.error(e) });
                SERVER_FLAG = true;
                SERVER_VERSION = version;
            }
        } catch (e) {
            logger.error("DSF server is not access: " + e);
            SERVER_FLAG = false;
        }
    }, secendInterval * 1000);
}

