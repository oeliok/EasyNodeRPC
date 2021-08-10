const express = require('express');
const logger = require("../../lib/log");
const router = express.Router();
module.exports = router;
const {
    handleRemoteCall, getProviderServices
} = require("../service/localService");
const {
    addProvider, removeProvider, getCustomerServices, getCustomerRServices
} = require("../service/remoteService");

/**
 * 当前服务器状态信息
 */
router.post("/status", (req, res) => {
    res.json({
        status: true,
        code: 1,
        data: {
            provide: getProviderServices(),
            custom: getCustomerServices(),
            customr: getCustomerRServices()
        }
    });
});

// 提供心跳检查用的
router.post("/hello", (req, res) => {
    let { num } = req.body;
    res.json({ status, code: 1, data: num * 123 /* 提供计算验证 */ });
});

// 更新服务提供方信息
router.post("/notify", (req, res) => {
    let { flag, server, service } = req.body;
    res.json({ status: true, code: 1 });
    if (flag == 1) { // 新增
        addProvider({ server: server, service: service });
    } else if (flag == 2) { // 删除
        removeProvider({ server: server, service: service });
    }
});

// 远程调用入口，调用方为各个节点之间
router.post("/service/:name/:version/:method", async (req, res) => {
    logger.debug(req.ip, req.params);
    let { name, version, method } = req.params;
    try {
        let data = await handleRemoteCall(name + "_" + version, method, req.body);
        res.json({ data: data });
    } catch (e) {
        res.json({ status: false, code: 0, message: "Error " + e });
    }
})
