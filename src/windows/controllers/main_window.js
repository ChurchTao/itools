const path = require('path');
const { BrowserWindow } = require('electron');
const electronLocalShortcut = require('electron-localshortcut');
const AppConfig = require('../../configuration');

class MainWindow {
  constructor() {
    this.mainWindow = null;
    this.createMainWindow();
  }


  createMainWindow() {
    this.mainWindow = new BrowserWindow({
      width: 360,
      height: 640,
      resizable: false,
      fullscreenable: false,
      show: false,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        javascript: true,
        plugins: false,
        nodeIntegration: true,
        webSecurity: false,
        contextIsolation: false
      }
    });

    this.initWindowEvents();
    this.initMainWindowShortcut();
    this.mainWindow.loadURL(`file://${path.join(__dirname, '/../views/main.html')}`);

  }

  initWindowEvents() {
    this.mainWindow.on('close', (e) => {
      e.preventDefault();
      this.mainWindow.hide();
      this.isShown = false;
    });
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      // 控制台
      // this.mainWindow.webContents.openDevTools()
    });

    // Hide the window when it loses focus
    // window.on('blur', () => {
    //   window.hide()
    // })

  }

  show() {
    if (!this.mainWindow) {
      this.createMainWindow();
    }
    this.mainWindow.show();
  }

  hide() {
    this.mainWindow.hide();
  }

  toggleWindow() {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide()
    } else {
      this.mainWindow.show();
    }
  }


  registerLocalShortcut() {
    electronLocalShortcut.register(this.mainWindow, 'Esc', () => {
      this.mainWindow.close();
    });
  }

  unregisterLocalShortCut() {
    electronLocalShortcut.unregisterAll(this.mainWindow);
  }

  initMainWindowShortcut() {
    this.registerLocalShortcut();
  }

}

module.exports = MainWindow;
