const fs = require("fs")

class Plugin {
    constructor(json) {
        this.config = null;
        this.config = JSON.parse(json);
        console.log(this.config);
    }
}

var pluginPath = "/Users/church/itools_plugins"
// var files = fs.readdirSync(pluginPath);
// console.log(files);

let plugins = [];

const files = fs.readdirSync(pluginPath)
files.forEach((item, index) => {
    let _plguinDir = pluginPath + "/" + item;
    let config = fs.readFileSync(_plguinDir + "/plugin.json", { encoding: "utf-8" })
    plugins.push(new Plugin(config))
})