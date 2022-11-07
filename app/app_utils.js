/**
 *  Electron App Utils
 *  For writing data out with date/time stamps, etc.
 */
const path = require('path')
const os = require('os')
const fs = require('fs')
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
    ? path.join(os.homedir(), '.config/timelog/logs')
    : './timelog/logs';
const DEFAULT_CFG_DIR_NAME = (process.env['CFG_DIR_NAME'] != null)
  ? process.env['CFG_DIR_NAME'] 
  : (process.env['DEV'] == null)
    ? path.join(os.homedir(), '.config/')
    : './timelog/';
let sessionPrefix = DEFAULT_SESSION_PREFIX
let outDirName = DEFAULT_OUT_DIR_NAME
let cfgDirName = DEFAULT_CFG_DIR_NAME

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

function fileName(session_id) {
  return `${sessionPrefix}_${dateFileFmt(new Date())}_${session_id}.tlog`
  // return `${sessionPrefix}_${dateFileFmt(new Date())}.tlog`
}

function absFileName(session_id) {
  return path.join(outDirName, fileName(session_id))
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
  console.log('(D): writeData', session_id, data)
  // if ( !Array.isArray(data) ) {
  //     throw new ValueError('Data must be an array', data)
  // }
  // let buffer = data.map(record => record.join(',')).join('\n')
  fs.writeFileSync(fname, JSON.stringify(data))
}

async function loadDataJSON(e, session_id) {
  checkOutDir()
  const fname = absFileName(session_id)
  console.log('(D): loadData', session_id)
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

module.exports = {
  getSessionPrefix: getSessionPrefix,
  setSessionPrefix: setSessionPrefix,
  getOutDirName: getOutDirName,
  setOutDirName: setOutDirName,
  writeDataCSV: writeDataCSV,
  writeDataJSON: writeDataJSON,
  loadDataJSON: loadDataJSON,
  loadCfgCategories: loadCfgCategories,
  checkOutDir: checkOutDir,
}
