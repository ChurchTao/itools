const fs = require("fs")
const path = require('path');
const { BrowserWindow, nativeImage, app } = require('electron');
const clipboardWatcher = require('electron-clipboard-watcher')

const pluginPath = "/Users/church/vscodeProjects/itools_plugins"
class Plugin {
    constructor(json, absolutePath) {
        this.pluginWindow = null;
        this.config = null;
        this.absolutePath = absolutePath;
        this.config = JSON.parse(json);
        console.log("loading ... " + this.config.name);
        if (this.config.args.background) {
            app.once('ready', () => {
                this.createPluginWindow();
            })
        }
    }

    getAppId() {
        return this.config.appid;
    }

    getShortCut() {
        return this.config.shortCut;
    }

    open() {
        if (this.pluginWindow == null) {
            this.createPluginWindow();
            this.pluginWindow.show();
        } else {
            this.pluginWindow.show();
        }
    }


    createPluginWindow() {
        this.pluginWindow = new BrowserWindow({
            width: this.config.args.width,
            height: this.config.args.height,
            resizable: false,
            fullscreenable: false,
            show: false,
            webPreferences: {
                javascript: true,
                plugins: false,
                // 插件页面禁止开放 node js,只允许在preload.js中引入
                // nodeIntegration: true,
                webSecurity: false,
                contextIsolation: false,
                preload: `${this.absolutePath}/preload.js`
            }
        });
        this.pluginWindow.loadURL(`file://${this.absolutePath}/index.html`);

        this.pluginWindow.on('close', (e) => {
            e.preventDefault();
            this.pluginWindow.hide();
        });

        this.pluginWindow.on('show', () => {
            this.pluginWindow.webContents.openDevTools()
        });

        //剪切板操作
        let that = this;
        clipboardWatcher({
            watchDelay: 1000,

            // handler for when image data is copied into the clipboard
            // onImageChange: function (image) {
            //   let img = image.toDataURL()
            //   console.log(img)
            //   win.webContents.send('copy-img',img)
            // },

            // handler for when text data is copied into the clipboard
            onTextChange: function (text) {
                that.pluginWindow.webContents.send('copy-text', text);
            }
        })
    }
}

class PluginLoader {
    constructor() {
        // 插件对象本身
        this.plugins = [];
        // 插件配置数组
        this.pluginConfigs = [];
        // 根据appid简历的插件索引
        this.pluginsMap = new Map();
        const files = fs.readdirSync(pluginPath)
        files.forEach((item, index) => {
            let _plguinDir = path.join(pluginPath, item)
            //检查某个目录是否存在
            let stat = fs.statSync(_plguinDir);
            if (!item.startsWith(".") && stat.isDirectory()) {
                let pluginJSONPath = path.join(_plguinDir, 'plugin.json');
                try {
                    fs.statSync(pluginJSONPath);
                    let config = fs.readFileSync(pluginJSONPath, { encoding: "utf-8" });
                    let pluginClass = new Plugin(config, _plguinDir);
                    this.plugins.push(pluginClass);
                    let configJSONObj = JSON.parse(config);
                    configJSONObj.absolutePath = _plguinDir;
                    this.pluginConfigs.push(configJSONObj);
                    this.pluginsMap.set(pluginClass.getAppId(), pluginClass);
                } catch (e) {
                    console.error(e);
                }
            }
        })
    }

    open(appid) {
        this.pluginsMap.get(appid).open();
    }

    getAllPlugins() {
        return this.plugins;
    }

    getAllPluginConfigs() {
        return this.pluginConfigs;
    }

}


module.exports = PluginLoader;