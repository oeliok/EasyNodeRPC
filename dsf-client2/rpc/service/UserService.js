exports.name = "com.oeli.login";
exports.version = "1.0"

const UserInterface = require("../interface/UserInterface");

exports.test = async function (name) {
    console.log(name);
    let r = await UserInterface.getHello(name);
    console.log(r);
    return r;
}