const { app, Tray, Menu } = require('electron');
const AppConfig = require('../../configuration');
const path = require('path');
const assetsPath = path.join(__dirname, '../../../assets');
class ItoolTary {
    constructor(win) {
        this.tary = null;
        this.mainWindow = win;
        this.createItoolTary();
    }

    createItoolTary() {
        this.tray = new Tray(path.join(assetsPath, 'status_bar.png'))
        var contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show DevTools',
                accelerator: 'Alt+Command+I',
                click: () => {
                    this.mainWindow.show();
                    this.mainWindow.openDevTools();
                }
            },
            {
                label: 'Quit',
                accelerator: 'Command+Q',
                click: () => {
                    app.exit();
                }
            }
        ]);
        this.tray.setToolTip('This is my application.');
        this.tray.setContextMenu(contextMenu);
        this.tray.on('click', (event) => {
            this.mainWindow.show()
        })
    }

}

module.exports = ItoolTary;
