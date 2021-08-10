/**
 * 
 */
let https = require('http');

/**
 * 检查是否为空
 * @param {*} obj 
 * @returns 
 */
exports.checkNullAndEmptyString = function (obj) {
    if (obj == undefined || obj == null || typeof obj != "string" || obj.length == 0) {
        return true;
    }
    return false;
}

/**
 * 发送http post json调用
 * @param {*} ip 
 * @param {*} port 
 * @param {*} path 
 * @param {*} data 
 * @returns 
 */
exports.sendMessage = function (ip = "", port = 0, path = "", data) {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'POST',
            'hostname': ip,
            'port': port,
            'path': path,
            'headers': {
                'Content-Type': 'application/json'
            },
            'maxRedirects': 20
        };

        let req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                resolve(JSON.parse(body.toString()));
            });

            res.on("error", function (error) {
                reject(error);
            });
        });

        let postData = JSON.stringify(data);

        req.on("error", (err) => { reject(err) });
        req.write(postData);
        req.end();
    });
}

/**
 * 发送http post json调用
 * @param {*} ip 
 * @param {*} port 
 * @param {*} path 
 * @param {*} data 
 * @returns 
 */
exports.sendMessageTxt = function (ip = "", port = 0, path = "", data) {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'POST',
            'hostname': ip,
            'port': port,
            'path': path,
            'headers': {
                'Content-Type': 'application/json'
            },
            'maxRedirects': 20
        };

        let req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                resolve(JSON.parse(body.toString()));
            });

            res.on("error", function (error) {
                reject(error);
            });
        });

        let postData = JSON.stringify(data);

        req.write(postData);
        req.end();
    });
}

