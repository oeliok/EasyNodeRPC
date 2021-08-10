/**
 * 负责维护远程的服务信息
 */
 const fs = require("fs");
 const { sendMessage, checkNullAndEmptyString } = require("../../lib/util");
 const logger = require("../../lib/log");
 
 // 远程能提供的服务
 const SERVICES = {
     // "servicename": ["ip:port"]
 };
 
 // 需要消费的服务
 const CUSTOMSERVICE = [
     // { name: "", version: "" }
 ];
 
 // 进行接口的初始化，调度算法为随机分配
 function interfaceHandleRandom(classobj = {}) {
     logger.info(classobj);
     let { name, version } = classobj;
     let key = name + "_" + version;
     if (checkNullAndEmptyString(name) || checkNullAndEmptyString(version)) {
         logger.warn("Service", key, "is not exist!");
         return;
     }
     CUSTOMSERVICE.push({ name: name, version: version });
     for (let method in classobj) {
         if (typeof classobj[method] == "function") {
             let url = "/dsf/service/" + name + "/" + version + "/" + method;
             classobj[method] = function () {
                 let pp = arguments;
                 return new Promise((resolve, reject) => {
                     if (SERVICES[key] && SERVICES[key].length > 0) {
                         // 随机选择一个服务
                         let index = (Math.floor(Math.random()) * 1000) % SERVICES[key].length;
                         let servicestr = SERVICES[key][index];
                         logger.info(key, index, servicestr);
                         let arr = servicestr.split(":");
                         let pa = [];
                         for (let i in pp) {
                             pa.push(pp[i]);
                         }
                         sendMessage(arr[0], arr[1], url, pa)
                             .then((data) => { resolve(data.data) })
                             .catch((e) => { reject(e) });
                     } else {
                         reject(`Now ${key} no provider, check it`);
                     }
                 });
             }
         }
     }
 }
 
 /**
  * 初始化特定目录下得接口
  * @param {*} pdir 
  */
 exports.initRemoteService = function (servicedir = "") {
     const modules = fs.readdirSync(servicedir);
     for (let i = 0; i < modules.length; i++) {
         let module = modules[i];
         if (/^\w+.js$/.test(module)) {
             let obj = require(servicedir + "/" + module);
             interfaceHandleRandom(obj);
         }
     }
 }
 
 /**
  * 初始化服务信息
  * @param {"servicename":["ip:port"]} param 
  */
 exports.initProvider = function (param = {}) {
     for (let i in param) {
         SERVICES[i] = param[i];
     }
 }
 
 /**
  * 添加服务
  * @param {server: "servicename", provider:["ip:port"]} param 
  */
 exports.addProvider = function ({ server, service }) {
     for (let i in service) {
         if (SERVICES[service[i]]) {
             SERVICES[service[i]].push(server);
         } else {
             SERVICES[service[i]] = [server];
         }
     }
 }
 
 /**
  * 删除服务提供方
  * @param {*} param0 
  */
 exports.removeProvider = function ({ server, service }) {
     for (let i in service) {
         let ps = SERVICES[service[i]];
         if (ps) {
             let arr = ps.filter((v) => {
                 if (v == server) {
                     return false;
                 }
                 return true;
             });
             SERVICES[service[i]] = arr;
         }
     }
 }
 
 // 提供本地需要的服务
 exports.getCustomerServices = function () {
     return CUSTOMSERVICE;
 }
 
 // 得到远程能提供的服务
 exports.getCustomerRServices = function () {
     return SERVICES;
 }
 