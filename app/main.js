// Modules to control application life and create native browser window
const {app, BrowserWindow, Notification, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
// const { mkdir } = require('node:fs/promises')
const parseArgs = require('minimist')

const appUtils = require('./main_utils.js')
const dbUtils = require('./db_utils.js')

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
// FIXME: Need proper checking for files that don't exist yet!!!
if (args.dir != null && args.dir !== "") {
  appUtils.setOutDirName(args.dir)
}
//  else {
//   const homedir = app.getPath('home')
//   const outdirName = path.join(homedir, '.timelogs')
//   fs.mkdir(outdirName, (err) => {
//     if (err.code != 'EEXIST') {
//       throw Error(err);
//     }
//   })
//   appUtils.setOutDirName(outdirName)
// }
if (args.prefix != null && args.prefix !== "") {
  appUtils.setSessionPrefix(args.prefix)
}
console.log(`(I): Using output dir: "${appUtils.getOutDirName()}"`)

/** MAIN **/
const isDev = parseBool(process.env['DEV'])

function ensureExists(path, mask, cb) {
  if (typeof mask == 'function') { // Allow the `mask` parameter to be optional
      cb = mask;
      mask = 0o744;
  }
  fs.mkdir(path, mask, function(err) {
      if (err) {
          if (err.code == 'EEXIST') cb(null); // Ignore the error if the folder already exists
          else cb(err); // Something else went wrong
      } else cb(null); // Successfully created folder
  });
}

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

function createErrorWindow(err) {
  const errWindow = new BrowserWindow({
    width: 300,
    height: 150,
    title: "Initialization Error",
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'err_preload.js')
    }
  })
  // TODO: Create a new window to display an error message.
  errWindow.loadFile('app/error-msg.html')
  errWindow.webContents.send('send-err', [err.name, err.message])
  // errWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady()
.then(() => {
  // TODO: Add other "initialization" checkers here.
  // Check: Config Dir, Output Dir, 
  // Optional Checks: categories.json file - don't display a warning if missing.
  return new Promise((resolve, reject) => {
    appUtils.checkOutDir()
    .then(resolve)
    .catch((err) => {
      console.error('(E) [main]: ', err.message)
      // TODO: Use createErrorWindow() instead of new Notification()
      // new Notification({title: err.name, body: err.message}).show()
      createErrorWindow(err)
      return reject(err)
      // process.exit(err.code) -- We may not want to exit without warning.
    })
  })
})
.then(() => {
  return new Promise((resolve, reject) => {
    dbUtils.connect_db()
    .then(resolve)
    .catch((err) => {
      console.error('(E) [main]: ', err.message)
      // TODO: Use createErrorWindow() instead of new Notification()
      // new Notification({title: err.name, body: err.message}).show()
      createErrorWindow(err)
      return reject(err)
    })
  })
})
.then(() => {
  console.log('(D): whenReady(): ', appUtils, appUtils.writeDataJSON)
  ipcMain.handle('appMeta.isDev', () => isDev)
  // ipcMain.handle('datastore.write', appUtils.writeDataJSON)
  // ipcMain.handle('datastore.load',  appUtils.loadDataJSON)

  
  ipcMain.handle('dataStore.writeTimeRecord', dbUtils.insertTimeRecord)
  ipcMain.handle('dataStore.writeAllTimeRecords', (ipcEvent, data) => { dbUtils.insertManyTimeRecords(data); })
  ipcMain.handle('dataStore.writeDaySummary', (ipcEvent, data) => { dbUtils.updateDaySummary(data); })
  
  ipcMain.handle('dataStore.loadTimeRecords', dbUtils.loadTimeRecords)
  ipcMain.handle('dataStore.loadDaySummary',  dbUtils.loadDaySummary)
  
  ipcMain.handle('config.categories.load',  appUtils.loadCfgCategories)
  ipcMain.handle('config.categories.edit',  appUtils.editCfgCategories)
  ipcMain.handle('config.absFileName',      appUtils.absFileName)
  ipcMain.handle('config.setSessionId', (ipcEvent, sessionId) => { appUtils.setSessionId(sessionId); })
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
