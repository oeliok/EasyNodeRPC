/**
 * 实现节点管理的功能
 */
const logger = require("../../lib/log");
const { foreachSendNotify } = require('./ncService');
// 存放节点初始化的上传的信息
const NODE_INFO = {
    // "IP+PORT": {
    //     lastbeat: 0,
    //     customer: [{ name: "", version: "" }],
    //     provider: [{ name: "", version: "" }]
    // }
};

// 存放汇总的服务信息
const SERVICES = {
    // "servicename": {
    //     provider: [""],
    //     customer: [""]
    // }
}

/**
 * 启动服务扫描检查任务
 * @param {*} scantime 扫描间隔，单位：毫秒
 * @param {*} timeout 服务心跳超时时间，单位：毫秒
 */
exports.startDetack = function (scantime = 10000, timeout = 12000) {
    setInterval(() => {
        let now = Date.now();
        for (let i in NODE_INFO) {
            // 如果更新时间超过了某个值就直接移除该节点信息
            if (NODE_INFO[i]) {
                console.log(Math.abs(now - NODE_INFO[i].lastbeat) > timeout, i);
                if (Math.abs(now - NODE_INFO[i].lastbeat) > timeout) {
                    logger.info("Remove node ", i);
                    let notifylist = removeNodeInfoAndService(i);
                    logger.info("notifylist", notifylist);
                    // 发送通知
                    foreachSendNotify(2, notifylist, i);
                }
            }
        }
    }, scantime);
}

exports.getAll = function () {
    return { nodeinfo: NODE_INFO, services: SERVICES };
}

exports.updateBeatTime = function (server = "") {
    if (NODE_INFO[server]) {
        NODE_INFO[server]["lastbeat"] = Date.now();
    }
}

// 保存节点原始信息
exports.addNodeInfo = function (key = "", customer = [], provider = []) {
    NODE_INFO[key] = {
        lastbeat: Date.now(),
        customer: customer,
        provider: provider
    }
    return true;
}

// 注册节点服务
exports.addService = function (server = "", provider = []) {
    let pubrvice = {};
    for (let i in provider) {
        let p = provider[i];
        let key = p.name + "_" + p.version;
        let ps = SERVICES[key];
        if (ps == undefined) {
            SERVICES[key] = {
                provider: [server],
                customer: []
            }
        } else {
            // 如果当前服务已经注册了就不要重复注册了
            if (SERVICES[key].provider.includes(server) == false) {
                SERVICES[key].provider.push(server);
            }
            // 需要通知订阅服务的节点有新的服务上线了
            pubrvice[key] = SERVICES[key].customer;
        }
    }
    return pubrvice;
}

// 注册订阅服务信息并获取订阅节点的信息
exports.addSubService = function (server = "", customer = []) {
    let subservice = {};
    for (let i in customer) {
        let c = customer[i];
        let key = c.name + "_" + c.version;
        let cs = SERVICES[key];
        if (cs == undefined) {
            SERVICES[key] = {
                provider: [],
                customer: [server]
            }
        } else {
            if (SERVICES[key].customer.includes(server) == false) {
                SERVICES[key].customer.push(server);
            }
            subservice[key] = SERVICES[key].provider;
        }
    }
    return subservice;
}

// 删除节点信息
function removeNodeInfoAndService(server = "") {
    let { customer, provider } = NODE_INFO[server];
    // 删除订阅的服务
    for (let i in customer) {
        let key = customer[i].name + "_" + customer[i].version;
        let r = SERVICES[key];
        let arr = r.customer.filter((v) => {
            if (server == v) {
                return false;
            }
            return true;
        })
        r.customer = arr;
    }
    // 找到订阅自己提供服务的所有节点
    let notify = {};
    for (let i in provider) {
        let key = provider[i].name + "_" + provider[i].version;
        let r = SERVICES[key];
        let arr = r.provider.filter((v) => {
            if (server == v) {
                return false;
            }
            return true;
        })
        r.provider = arr;
        notify[key] = r.customer;
    }
    NODE_INFO[server] = undefined;
    return notify;
}
exports.removeNodeInfoAndService = removeNodeInfoAndService;

