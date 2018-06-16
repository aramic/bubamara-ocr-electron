// main.js

electron = require('electron')
app = electron.app
BrowserWindow = electron.BrowserWindow
fs = require('fs-extra')
path = require('path')
cache = app.getPath('userData') + '/cache/'

let mainWindow = null
const createWindow = () => {
  mainWindow = new BrowserWindow({width: 320, height: 400})
  mainWindow.loadURL(require('url').format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
    webPreferences: {
      devTools: false
    }
  }))
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  fs.remove(cache)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Start Python processes
require('./pyproc.js')