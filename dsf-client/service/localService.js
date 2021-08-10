/**
 * 负责维护本地的服务
 * 提供本程序需要的服务清单和提供的服务清单
 */
const fs = require("fs");
const logger = require("../../lib/log");
const { checkNullAndEmptyString } = require("../../lib/util");

// 本地可以提供的服务
const LOCALSERVICE = {
    // "servicename": function (param) {
    //     return { status: true, code: 1, message: "Do successful!", data: param }
    // }
};
// 本地全量的服务，在初始化的时候用到
const EXISTSERVICE = [
    // { name: "", version: "" }
];

/**
 * 获取本地能提供的服务清单
 */
exports.getProviderServices = function () {
    return EXISTSERVICE;
}

/**
 * 初始化本地的可用服务
 */
exports.initLocalService = function (servicedir = "") {
    const modules = fs.readdirSync(servicedir);
    for (let i = 0; i < modules.length; i++) {
        let module = modules[i];
        if (/^\w+.js$/.test(module)) {
            let sercice = require(servicedir + "/" + module);
            let { name, version } = sercice;
            logger.info("Find service " + module, name, version);
            if (checkNullAndEmptyString(name) || checkNullAndEmptyString(version)) {
                logger.warn(`${module} don't have name or version, please check it.`);
            } else {
                EXISTSERVICE.push({ name: name, version: version });
                let key = name + "_" + version;
                if (LOCALSERVICE[key]) {
                    logger.warn(`Exist same name service: ${key}`);
                } else {
                    LOCALSERVICE[key] = sercice;
                    logger.info(`Add service ${key}`);
                }
            }
        }
    }
}

/**
 * 处理来自远程的调用
 */
exports.handleRemoteCall = async function (servicename = "", method = "", param = []) {
    // logger.info(LOCALSERVICE)
    logger.info(servicename, method, param);
    if (LOCALSERVICE[servicename]) {
        return await LOCALSERVICE[servicename][method](...param);
    } else {
        return { status: false, code: 0, message: "Service is not support." };
    }
}

