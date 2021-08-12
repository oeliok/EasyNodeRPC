const Path = require("path");

module.exports = {
    // 服务暴露地址，默认0-随机分配
    port: 0,
    // 注册中心的地址
    dsfserver: "127.0.0.1:3000",
    // RPC接口路径，绝对路径，不支持递归
    rpcinterface: [Path.resolve(__dirname + "/interface")],
    // RPC服务路径，绝对路径，不支持递归
    rpcservice: [Path.resolve(__dirname + "/service")]
}