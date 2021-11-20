const fs = require("fs")
const path = require('path');
const { BrowserWindow, nativeImage, app } = require('electron');

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
                plugins: false,
                // 插件页面禁止开放 node js,只允许在preload.js中引入
                // nodeIntegration: true,
                contextIsolation: false,
                // preload: path.join(this.absolutePath, '_preload.js')
                preload: path.join(path.join(__dirname, 'tmp'), this.config.appid + '_preload.js')
            }
        });
        this.pluginWindow.loadURL(path.join(`file://${this.absolutePath}`, 'index.html'));

        this.pluginWindow.on('close', (e) => {
            e.preventDefault();
            this.pluginWindow.hide();
        });

        this.pluginWindow.on('show', () => {
            this.pluginWindow.webContents.openDevTools()
        });

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
        let tmpPath = path.join(__dirname, 'tmp');
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(path.join(__dirname, 'tmp'));
        }
        files.forEach((item, index) => {
            // 插件所在目录
            let _plguinDir = path.join(pluginPath, item)
            // 检查某个目录是否存在
            if (fs.existsSync(_plguinDir)) {
                let stat = fs.statSync(_plguinDir);
                if (!item.startsWith(".") && stat.isDirectory()) {
                    let pluginJSONPath = path.join(_plguinDir, 'plugin.json');
                    try {
                        fs.statSync(pluginJSONPath);
                        let config = fs.readFileSync(pluginJSONPath, { encoding: "utf-8" });
                        let configJSONObj = JSON.parse(config);
                        configJSONObj.absolutePath = _plguinDir;
                        if (configJSONObj) {
                            let _defaultPreloadJSPath = path.join(__dirname, 'preload.js');
                            let _defaultPreloadJS = fs.readFileSync(_defaultPreloadJSPath, { encoding: "utf-8" });
                            if (configJSONObj.preload && configJSONObj.preload != "") {
                                // 如果preload存在，则重新融合生成一个preload
                                // 否则直接使用自带的
                                let pluginPreloadJsPath = path.join(_plguinDir, configJSONObj.preload);
                                console.log('读取 preloadjs 目录: ' + pluginPreloadJsPath);
                                let preloadjs = fs.readFileSync(pluginPreloadJsPath, { encoding: "utf-8" });
                                _defaultPreloadJS = _defaultPreloadJS + '\n' + preloadjs;
                            }
                            fs.writeFileSync(path.join(tmpPath, configJSONObj.appid + '_preload.js'), _defaultPreloadJS, 'utf-8')
                            // 创建插件对象
                            let pluginClass = new Plugin(config, _plguinDir);
                            this.plugins.push(pluginClass);
                            // 保存插件配置
                            this.pluginConfigs.push(configJSONObj);
                            this.pluginsMap.set(pluginClass.getAppId(), pluginClass);
                        }
                    } catch (e) {
                        console.error(e);
                    }
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