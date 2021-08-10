/**
 * 负责管理服务公共部分
 */
let Path = require("path");
let { sendMessage } = require("../../lib/util");
let { dsfserver } = require("../config/application.json");
let logger = require("../../lib/log");
let { initLocalService, getProviderServices } = require("./localService");
let { initRemoteService, getCustomerServices, initProvider } = require("./remoteService");

/**
 * 初始化
 * @param {*} path 
 * @param {*} port 
 */
exports.initRpcService = async function (port = 0) {
    // 初始化本地能提供的服务
    initLocalService(Path.resolve(__dirname + "/../rpc/service"));
    // 初始化本地需要消费的服务
    initRemoteService(Path.resolve(__dirname + "/../rpc/interface"));
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
 * 关闭服务
 */
exports.stopRpcService = async function () {
    // 主要是主动向服务注册中心发送下线信息
    let arr = dsfserver.split(":");
    let { status } = sendMessage(arr[0], arr[1], "/dsf/stop", {});
    logger.info("Send stop message to registor: " + status);
}