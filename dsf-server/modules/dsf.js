const express = require('express');
const logger = require("../../lib/log");
const router = express.Router();
module.exports = router;
const { getAll, updateBeatTime, addNodeInfo, addService, addSubService, removeNodeInfoAndService } = require("../service/nmService");
const { heartBeat, foreachSendNotify } = require("../service/ncService");

/**
 * 当前服务器状态信息
 */
router.post("/status", (req, res) => {
    res.json({ status: true, code: 1, data: getAll() });
});

/**
 * 提供心跳检查用的
 */
const SER_VERSION = Date.now();
router.post("/hello", (req, res) => {
    let { num, port } = req.body;
    updateBeatTime(req.ip + ":" + port);
    res.json({ status: true, code: 1, data: num * 123 /* 提供计算验证 */, version: SER_VERSION });
});

/**
 * 实现服务的注册，以及服务信心的订阅功能
 */
router.post("/start", (req, res) => {
    logger.info(req.body);

    // 获取请求数据
    let { port, custom, provide } = req.body;
    let ip = req.ip;
    let key = ip + ":" + port;

    // 保存节点信息
    addNodeInfo(key, custom, provide);

    // 注册服务和节点ip、端口和路径信息
    let custnode = addService(key, provide);
    let pronode = addSubService(key, custom);

    // 发送通知
    foreachSendNotify(1, custnode, key);


    // 返回可用的服务
    res.json({ code: 1, status: true, data: pronode });
});

/**
 * 实现服务不可用汇报，及时清理节点信息和通知其他服务
 */
router.post("/report", async (req, res) => {
    let { server } = req.body;
    let { status } = await heartBeat(server);
    if (status) {
        res.json({ status: true, code: 1, message: "服务运行正常" });
    } else {
        let notifylist = removeNodeInfoAndService(server);
        // 发送通知
        foreachSendNotify(2, notifylist);
        res.json({ status: true, code: 1, message: "服务已经注销" });
    }
});

/**
 * 实现服务的优雅下线
 */
router.post("/stop", (req, res) => {
    let { port } = req.body;
    let server = req.ip + ":" + port;
    let notifylist = removeNodeInfoAndService(server);
    // 发送通知
    foreachSendNotify(2, notifylist);
    res.json({ status: true, code: 1, message: "服务已经注销" });
});
