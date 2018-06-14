// main.js

electron = require('electron')
app = electron.app
BrowserWindow = electron.BrowserWindow
path = require('path')

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
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Start Python processes
require('./pyproc.js')

// Select image and analyze with BubamaraOCR.py
//require('./imgselect.js')