/**
 *  Electron App Utils
 *  For writing data out with date/time stamps, etc.
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const { spawn } = require('node:child_process')
const { format } = require('date-fns')


/** ERROR OBJECTS */
class ValueError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValueError'
  }
}

class FileError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FileError'
  }
}

class OutputDirectoryMissingError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'OutputDirectoryMissingError'
    this.code = code
  }
}

class ConfigDirectoryMissingError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ConfigDirectoryMissingError'
    this.code = code
  }
}


/** DEFAULT CONFIG VALUES */
const DEFAULT_SESSION_PREFIX = (process.env['PREFIX'] != null) ? process.env['PREFIX'] : 'timelog';
const DEFAULT_APP_DIR_NAME = (process.env['OUT_DIR_NAME'] != null)
  ? process.env['OUT_DIR_NAME'] 
  // : './timelog/logs'
  : (process.env['DEV'] == null)
    ? path.join(os.homedir(), '.timelog')
    : './timelog';
const DEFAULT_LOG_DIR_NAME = 'logs'
// TODO: use ~/.timelog/config as default for config
const DEFAULT_CFG_DIR_NAME = (process.env['CFG_DIR_NAME'] != null)
  ? process.env['CFG_DIR_NAME'] 
  : (process.env['DEV'] == null)
    ? path.join(os.homedir(), '.config/timelog/')
    : './timelog/';
const DEFAULT_SESSION_ID = "";
const DEFAULT_LOGBOOK_FiLE_NAME = 'logbook.db';

let sessionPrefix = DEFAULT_SESSION_PREFIX
let appDirName = DEFAULT_APP_DIR_NAME;
let outDirName = DEFAULT_LOG_DIR_NAME;        // TODO: rename 'outDirName' => 'logDirName'
let logbookName = DEFAULT_LOGBOOK_FiLE_NAME;
let cfgDirName = DEFAULT_CFG_DIR_NAME
let sessionId = DEFAULT_SESSION_ID;
let activeSessionDate = new Date()


/** CONFIG UTILITY FUNCTIONS */
function setAppDirName(dirname) {
  console.log("(D): setOutDirName(): ", dirname);
  appDirName = dirname;
}
function getAppDirName() {
  return appDirName;
}
function setOutDirName(dirname) {
  console.log("(D): setOutDirName(): ", dirname)
  outDirName = dirname
}
function getOutDirName() {
  return outDirName
}
function setLogbookName(name) {
  console.log("(D): setOutDirName(): ", name);
  logbookName = name;
}
function getLogbookName() {
  return logbookName;
}
function setCfgDirName(dirname) {
  console.log("(D): setOutDirName(): ", dirname)
  outDirName = dirname
}
function getCfgDirName() {
  return outDirName
}
function setSessionPrefix(prefix) {
  console.log("(D): setOutDirName(): ", prefix);
  sessionPrefix = prefix;
}
function getSessionPrefix() {
  return sessionPrefix;
}

function getActiveSessionDate() {
  return activeSessionDate;
}

function getSessionId() {
  return sessionId;
}

function setSessionId(sid) {
  sessionId = sid;
}

function dateFileFmt(date) {
  if (date instanceof Date && !isNaN(date))
    return format(date, 'yyyy-MMM-dd')
  else
    return "Invalid Date"
}

function fileName(date) {
  // TODO: rename 'fileName' => 'timeRecordFileName()'?
  // FIXME: How is it possible for typeof session_id !== string ???
  if (typeof sessionId !== 'string') {
    console.log('(E): fileName(): session_id is not a string (FIXME)', sessionId)
  }
  // console.log('(D): fileName session_id: ', session_id == null, session_id === "", session_id)
  let session_str = (typeof sessionId !== 'string' || sessionId === "") ? "" : `_${sessionId}`
  return `${sessionPrefix}_${dateFileFmt(date)}${session_str}.tlog`
  // return `${sessionPrefix}_${dateFileFmt(new Date())}.tlog`
}

function absFileName() {
  // TODO: rename 'absFileName' => 'timeRecordAbsFileName()'?
  const fname = path.join(appDirName, outDirName, fileName(activeSessionDate))
  // console.log('(D): absFileName(): ', session_id==null, session_id==="", typeof session_id, session_id, fname)
  return fname
}

function absLogbookFileName() {
  // Fully-resolved absolute file path for logbook
  const fname = path.join(appDirName, logbookName)
  console.log('(D): absLogbookFileName(): ', fname)
  return fname
}

async function checkOutDir() {
  // TODO: Rename 'checkOutDir' => 'checkAppDirs' or 'checkDirs'?
  try {
    return await Promise.all([
      new Promise((resolve, reject) => {
        console.log("(D): checkOutDir(): ", appDirName)
        fs.stat(path.join(appDirName), (err, stats) => {
          if ( err != null ) {
            return reject(new OutputDirectoryMissingError(err.code, `Missing Output Diretory: ${appDirName}`)) 
          }
          else { return resolve(stats) }
        })
      }),
      new Promise((resolve, reject) => {
        console.log("(D): checkOutDir(): ", outDirName)
        let logdir = path.join(appDirName, outDirName)
        fs.stat(logdir, (err, stats) => {
          if ( err != null ) {
            return reject(new OutputDirectoryMissingError(err.code, `Missing Output Diretory: ${logdir}`)) 
          }
          else { return resolve(stats) }
        })
      }),
    ])
  } catch (err) {
    throw err
  }
}

async function checkCfgDir() {
  try {
    return await new Promise((resolve, reject) => {
      console.log("(D): checkCfgDir(): ", cfgDirName)
      fs.stat(cfgDirName, (err, stats) => {
        if ( err != null) { return reject(new ConfigDirectoryMissingError(err.code, `Missing Config Diretory: ${cfgDirName}`)) }
        else { return resolve(stats) }
      })
    })
  } catch (err) {
    throw err
  }
}

async function writeDataCSV(e, session_id, data) {
  checkOutDir()
  const fname = absFileName(session_id)
  console.log('(D): writeData', session_id, data)
  if ( !Array.isArray(data) ) {
      throw new ValueError('Data must be an array', data)
  }
  let buffer = data.map(record => record.join(',')).join('\n')
  fs.writeFileSync(fname, buffer)
}

async function writeDataJSON(e, session_id, data) {
  checkOutDir()
  const fname = absFileName(session_id)
  console.log('(D): writeData', fname, session_id, data)
  // if ( !Array.isArray(data) ) {
  //     throw new ValueError('Data must be an array', data)
  // }
  // let buffer = data.map(record => record.join(',')).join('\n')
  // console.log('(D): writeDataJSON: ', data)
  fs.writeFileSync(fname, JSON.stringify(data))
}

async function loadDataJSON(e, session_id) {
  try {
    checkOutDir()
    const fname = absFileName(session_id)
    console.log('(D): loadData', fname, session_id)
    // if ( !Array.isArray(data) ) {
    //     throw new ValueError('Data must be an array', data)
    // }
    // let buffer = data.map(record => record.join(',')).join('\n')
    return JSON.parse(fs.readFileSync(fname))
  } catch (e) {
    console.warn('(W): caught error: ', e)
    return null
  }
}

async function loadCfgCategories() {
  checkCfgDir()
  const fname = path.join(cfgDirName, 'categories.json')
  return JSON.parse(fs.readFileSync(fname))
}

async function editCfgCategories() {
  checkCfgDir()
  const fname = path.join(cfgDirName, 'categories.json')
  // spawn('open', [fname])
  // if (process.env['EDITOR'] != null) {
  //   // FIXME: This may be a cli app like 'vi'
  //   console.log('(I): Starting ', process.env['EDITOR'])
  //   spawn(process.env['EDITOR'], ['$EDITOR'])
  // } else {
    // FIXME: Only works for MacOS
    console.log('(I): Starting TextEdit')
    spawn('open', ['-a', 'TextEdit', fname])
  // }
}


module.exports = {
  getSessionPrefix: getSessionPrefix,
  setSessionPrefix: setSessionPrefix,
  getOutDirName: getOutDirName,
  setOutDirName: setOutDirName,
  // getActiveSessionFileName: getActiveSessionFileName,
  // setActiveSessionFileName: setActiveSessionFileName,
  writeDataCSV: writeDataCSV,
  writeDataJSON: writeDataJSON,
  loadDataJSON: loadDataJSON,
  loadCfgCategories: loadCfgCategories,
  editCfgCategories: editCfgCategories,
  checkOutDir: checkOutDir,
  fileName: fileName,
  absFileName: absFileName,
  absLogbookFileName: absLogbookFileName,
  getSessionId: getSessionId,
  setSessionId: setSessionId,
  getSessionPrefix: getSessionPrefix,
  getSessionDate: getActiveSessionDate,
  dateFileFmt: dateFileFmt,
  OutputDirectoryMissingError: OutputDirectoryMissingError,
}
