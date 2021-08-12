exports.name = "com.oeli.hello";
exports.version = "1.0"

const UserInterface = require("../interface/UserInterface");

exports.say = async function (name) {
    let r = await UserInterface.getHello(name);
    return r;
}