const { app, Tray, ipcMain, Menu, globalShortcut } = require('electron');
const AppConfig = require('./configuration');
const MainWindow = require('./windows/controllers/main_window');
const ItoolTary = require('./windows/controllers/tary');
const PluginLoader = require("./plugins/pluginLoader.js")

Menu.setApplicationMenu(null) //取消菜单栏
app.whenReady().then(() => {
  //取消dock栏显示
  // app.dock.hide()
})
class ElectronicItools {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.pluginLoader = null;
  }

  init() {
    if (this.checkInstance()) {
      this.initApp();
    } else {
      app.quit();
    }
  }
  checkInstance() {
    // 确认单例
    const lock = app.requestSingleInstanceLock();
    if (!lock) {
      app.quit();
    } else {
      return true;
    }
  }
  initApp() {
    this.initPlugins();
    app.on('ready', () => {
      this.createMainWindow();
      this.createTary();
      this.initIpcMain();

      // 为外部插件注册快捷键
      this.pluginLoader.getAllPlugins().forEach((plugin) => {
        let shortCut = plugin.getShortCut();
        if (shortCut) {
          //监听快捷键
          globalShortcut.register(shortCut, () => {
            (plugin.pluginWindow.isVisible() ? plugin.pluginWindow.hide() : plugin.pluginWindow.show())
          })
        }
      })
    });
    app.on('activate', () => {
      this.mainWindow.show();
    });
  };

  initPlugins() {
    // 加载外部插件
    this.pluginLoader = new PluginLoader();
  }

  initIpcMain() {
    // 设置通信管道
    ipcMain.on('openPlugins', (event, arg) => {
      // event.reply('asynchronous-reply', 'pong')
      this.pluginLoader.open(arg);
    });

    ipcMain.on('getAllPlugins', (event, arg) => {
      event.reply('getAllPlugins-reply', this.pluginLoader.getAllPluginConfigs())
    });
  }

  createMainWindow() {
    // 创建主程序页面
    this.mainWindow = new MainWindow();
    this.mainWindow.show();
  }

  createTary() {
    // 创建托盘图标
    this.tray = new ItoolTary(this.mainWindow);
  }

}

new ElectronicItools().init();
