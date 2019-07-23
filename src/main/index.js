'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
log.transports.console.level = 'info'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

let icon_path;
const isWin32 = process.platform == 'win32' ? true : false;
if (isWin32) {
  icon_path = __static + '/app.ico';
} else {
  icon_path = __static + '/app.icns';
}
function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    useContentSize: true,
    center: true,
    minWidth: 1250,
    minHeight: 768,
    icon: icon_path
  })

  mainWindow.loadURL(winURL)
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)
// 关闭Chromium https证书验证
app.commandLine.appendSwitch('ignore-certificate-errors');
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */




autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})
function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});
ipcMain.once("startUpdate" , () => {
  log.info('startUpdate')
  console.log(11111);
  
  autoUpdater.checkForUpdatesAndNotify()
})
// app.on('ready', () => {
  // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdatesAndNotify()
// })
 
