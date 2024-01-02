/**
 *  Electron App Utils
 *  For writing data out with date/time stamps, etc.
 *  TODO: rename to "main_utils.js"
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
const { spawn } = require('node:child_process')
const { format } = require('date-fns')

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

// TODO: use ~/.config/timelog/logs as the default now.
const DEFAULT_SESSION_PREFIX = (process.env['PREFIX'] != null) ? process.env['PREFIX'] : 'timelog'
const DEFAULT_OUT_DIR_NAME = (process.env['OUT_DIR_NAME'] != null)
  ? process.env['OUT_DIR_NAME'] 
  // : './timelog/logs'
  : (process.env['DEV'] == null)
    ? path.join(os.homedir(), '.timelog/logs')
    : './timelog/logs';
const DEFAULT_CFG_DIR_NAME = (process.env['CFG_DIR_NAME'] != null)
  ? process.env['CFG_DIR_NAME'] 
  : (process.env['DEV'] == null)
    ? path.join(os.homedir(), '.config/timelog/')
    : './timelog/';
let sessionPrefix = DEFAULT_SESSION_PREFIX
let outDirName = DEFAULT_OUT_DIR_NAME
let cfgDirName = DEFAULT_CFG_DIR_NAME
let activeSessionDate = new Date()

function setOutDirName(dirname) {
  console.log("(D): setOutDirName(): ", dirname)
  outDirName = dirname
}
function getOutDirName() {
  return outDirName
}
function setCfgDirName(dirname) {
  console.log("(D): setOutDirName(): ", dirname)
  outDirName = dirname
}
function getCfgDirName() {
  return outDirName
}
function setSessionPrefix(dirname) {
  console.log("(D): setOutDirName(): ", sessionPrefix)
  outDirName = sessionPrefix
}
function getSessionPrefix() {
  return sessionPrefix
}

function dateFileFmt(date) {
  if (date instanceof Date && !isNaN(date))
    return format(date, 'yyyy-MMM-dd')
  else
    return "Invalid Date"
}

function fileName(date, session_id) {
  // FIXME: How is it possible for typeof session_id !== string ???
  if (typeof session_id !== 'string') {
    console.log('(E): fileName(): session_id is not a string: ', session_id)
  }
  // console.log('(D): fileName session_id: ', session_id == null, session_id === "", session_id)
  let session_str = (typeof session_id !== 'string' || session_id === "") ? "" : `_${session_id}`
  return `${sessionPrefix}_${dateFileFmt(date)}${session_str}.tlog`
  // return `${sessionPrefix}_${dateFileFmt(new Date())}.tlog`
}

function absFileName(session_id) {
  const fname = path.join(outDirName, fileName(activeSessionDate, session_id))
  // console.log('(D): absFileName(): ', session_id==null, session_id==="", typeof session_id, session_id, fname)
  return fname
}

async function checkOutDir() {
  try {
    return await new Promise((resolve, reject) => {
      console.log("(D): checkOutDir(): ", outDirName)
      fs.stat(outDirName, (err, stats) => {
        if ( err != null) { return reject(new OutputDirectoryMissingError(err.code, `Missing Output Diretory: ${outDirName}`)) }
        else { return resolve(stats) }
      })
    })
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
  fs.writeFileSync(fname, JSON.stringify(data))
}

async function loadDataJSON(e, session_id) {
  checkOutDir()
  const fname = absFileName(session_id)
  console.log('(D): loadData', fname, session_id)
  // if ( !Array.isArray(data) ) {
  //     throw new ValueError('Data must be an array', data)
  // }
  // let buffer = data.map(record => record.join(',')).join('\n')
  return JSON.parse(fs.readFileSync(fname))
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
  absFileName: absFileName,
  OutputDirectoryMissingError: OutputDirectoryMissingError,
}
