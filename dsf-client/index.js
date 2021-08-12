// 先判断配置文件在哪里，指定配置后会自动替换
// console.log(process.argv);
if (process.argv.length > 2) {
    let nconf = require(process.argv[2]);
    let oconf = require("./config/application.js");
    for (let i in oconf) {
        if (nconf[i]) {
            oconf[i] = nconf[i];
        }
    }
}

const fs = require("fs");
const { heartbeat, port, httpmodule } = require("./config/application.js");
const express = require('express');
const logger = require("../lib/log");
const app = express();

app.use((req, res, next) => {
    req.startTime = new Date(); // 获取时间 t1

    let calResponseTime = function () {
        let now = new Date(); //获取时间 t2
        let deltaTime = now - req.startTime;
        logger.info(`${req.method} ${res.statusCode} ${req.originalUrl} ${deltaTime}`);
    }

    res.once('finish', calResponseTime);
    return next();
});

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// http路由模块加载
function addHTTPModule(abspath = "") {
    const modules = fs.readdirSync(abspath);
    for (let i = 0; i < modules.length; i++) {
        let module = modules[i];
        if (/^\w+.js$/.test(module)) {
            logger.info("Find module " + module);
            app.use("/" + module.replace(".js", "") + "/", require(abspath + "/" + module));
        }
    }
}

// 添加默认的分布式模块
addHTTPModule(__dirname + "/" + "modules");
// 添加用户配置的模块
for (let i in httpmodule) {
    addHTTPModule(httpmodule[i]);
}


app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ code: 0, status: false, message: 'Something broke!' });
});

const { initRpcService, sendHeartBeat } = require("./service/springService");
const server = app.listen(port, "0.0.0.0", () => {
    logger.info(`DSF-CLIENT listening at http://localhost:${server.address().port}`);
    initRpcService(server.address().port);
    sendHeartBeat(heartbeat);
});




