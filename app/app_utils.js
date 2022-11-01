/**
 *  Electron App Utils
 *  For writing data out with date/time stamps, etc.
 */
const path = require('path')
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

const SESSION_PREFIX = (process.env['PREFIX'] != null) ? process.env['PREFIX'] : 'timelog'
const OUT_DIR_NAME = (process.env['PREFIX'] != null) ? process.env['OUT_DIR_NAME'] : './timelog/logs'

function dateFileFmt(date) {
  if (date instanceof Date && !isNaN(date))
    return format(date, 'yyyy-MMM-dd')
  else
    return "Invalid Date"
}

function fileName(session_id) {
  return `${SESSION_PREFIX}_${dateFileFmt(new Date())}_${session_id}.tlog`
  // return `${SESSION_PREFIX}_${dateFileFmt(new Date())}.tlog`
}

function absFileName(session_id) {
  return path.join(OUT_DIR_NAME, fileName(session_id))
}

async function checkOutDir() {
  try {
    return await new Promise((resolve, reject) => {
      fs.stat(OUT_DIR_NAME, (err, stats) => {
        if ( err != null) { return reject(new OutputDirectoryMissingError(err.code, `Missing Output Diretory: ${OUT_DIR_NAME}`)) }
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

module.exports = {
  writeDataCSV: writeDataCSV,
  writeDataJSON: writeDataJSON,
  checkOutDir: checkOutDir,
}
