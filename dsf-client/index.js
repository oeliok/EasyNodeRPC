const fs = require("fs");
let { heartbeat } = require("./config/application.json");
const express = require('express');
const logger = require("../lib/log");
const app = express();
const port = 3000;

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

const mn = "modules";
const modules = fs.readdirSync(__dirname + "/" + mn);
for (let i = 0; i < modules.length; i++) {
    let module = modules[i];
    if (/^\w+.js$/.test(module)) {
        logger.info("Find module " + module);
        app.use("/" + module.replace(".js", "") + "/", require("./" + mn + "/" + module));
    }
}

app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ code: 0, status: false, message: 'Something broke!' });
});

const { initRpcService, sendHeartBeat } = require("./service/springService");
const server = app.listen(0, "0.0.0.0", () => {
    logger.info(`DSF-CLIENT listening at http://localhost:${server.address().port}`);
    initRpcService(server.address().port);
    sendHeartBeat(heartbeat);
});


