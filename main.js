// main.js

electron = require('electron')
app = electron.app
BrowserWindow = electron.BrowserWindow
fs = require('fs-extra')
path = require('path')
outputCache = app.getPath('userData') + '/outputCache/'
inputCache = app.getPath('userData') + '/inputCache/'

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
  fs.remove(inputCache)
  fs.remove(outputCache)
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  fs.remove(inputCache)
  fs.remove(outputCache)  
  if (mainWindow === null) {
    createWindow()
  }
})

// Start Python processes
require('./pyproc.js')