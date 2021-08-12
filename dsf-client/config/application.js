const Path = require("path");

module.exports = {
    // 服务暴露地址，默认0-随机分配
    port: 0,
    // 注册中心的地址
    dsfserver: "127.0.0.1:3000",
    // 心跳间隔最小时间，单位：秒
    heartbeat: 8,
    // http模块路径，绝对路径，不支持递归
    httpmodule: [],
    // RPC接口路径，绝对路径，不支持递归
    rpcinterface: [],
    // RPC服务路径，绝对路径，不支持递归
    rpcservice: []
}