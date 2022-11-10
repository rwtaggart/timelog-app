// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const parseArgs = require('minimist')

const appUtils = require('./app_utils.js')

console.log('(D): Running main.js ...')

/** Utilities  **/
function parseBool(s) {
  if (s == null) { return s; }
  if (typeof(s) === 'string' ) { s = s.trim().toLowerCase() }
  switch(s) { 
    case true: case 1: case "true":  case "yes": case "1": case "t": return true;
    default: return false;
  }
}

/** PARSE ARGS **/
const HELP_MSG = 'USAGE: npx electron . [OPTIONS] \n\
ARGS:\n\
-d --dir  LOG_DATA_PATH   Path to output log data directory\n\
'

const opts = {
  boolean: ['help'],
  string: ['dir', 'prefix'],
  alias: {
    'help': 'h', 
    'dir': 'd', 
    'prefix':'p'
  },
}
const args = parseArgs(process.argv.slice(2), opts)
if (args.help) {
  console.log(HELP_MSG)
  process.exit(0)
}
if (args.dir != null && args.dir !== "") {
  appUtils.setOutDirName(args.dir)
}
if (args.prefix != null && args.prefix !== "") {
  appUtils.setSessionPrefix(args.prefix)
}
console.log(`(I): Using output dir: "${appUtils.getOutDirName()}"`)

/** MAIN **/
const isDev = parseBool(process.env['DEV'])
appUtils.checkOutDir().catch((err) => {
  console.error('(E) [main]: ', err.message)
  process.exit(err.code)
})

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })

  ipcMain.on('write', (event, data) => {
    console.log('(D): Writing data...')
    fs.writeFileSync("./data_test_1.out", JSON.stringify(data));
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  // mainWindow.loadURL(
  //   isDev
  //   ? 'http://localhost:3000'
  //   : `file://${path.join(__dirname, '../build/index.html')}`
  // )
  isDev 
    ? mainWindow.loadURL('http://localhost:3000')
    : mainWindow.loadFile('build/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  console.log('(D): whenRead(): ', appUtils, appUtils.writeDataJSON)
  ipcMain.handle('appMeta:isDev', () => isDev)
  ipcMain.handle('datastore:write', appUtils.writeDataJSON)
  ipcMain.handle('datastore:load',  appUtils.loadDataJSON)
  ipcMain.handle('config:categories:load',  appUtils.loadCfgCategories)
  ipcMain.handle('config:categories:edit',  appUtils.editCfgCategories)
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') 
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
