/**
 * Utility Methods
 * TODO: split into:
 *  - dtutils.js -- for DateTime utilities
 *  - api.js     -- for API calls and stuff
 */

/* TIME & DATE UTILS */
import { format, parse } from 'date-fns'

export function dateFmt(date) {
  if (date instanceof Date && !isNaN(date))
    return format(date, 'EEE, MMM. dd')
  else
    return "Invalid Date"
}

export function timeFmt(time) {
  if (time instanceof Date && !isNaN(time))
    return format(time, 'h:mmaaa')
  else
    return "Invalid Time"
}

export function parseDate(dateStr) {
  return parse(dateStr, 'EEE, MMM. dd', new Date())
}

export function parseDateTime(dateStr, timeStr) {
  return parse(dateStr + ' ' + timeStr, 'EEE, MMM. dd h:mmaaa', new Date())
}

export function parseTime(timeStr) {
  return parse(timeStr, 'h:mmaaa', new Date())
}

/* DATA STORE UTILS */
class ElectronError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ElectronError'
  }
}

export function hasAPI(name) {
  if ( window[name] == null) {
    throw new ElectronError('Electron APIs are not available!')
  }
  return true
}

export async function writeData(session_id, data) {
  hasAPI('dataStore')
  return await window.dataStore.write(session_id, data)
}

export async function loadData(session_id) {
  hasAPI('dataStore')
  return await window.dataStore.load(session_id)
}

export async function isDev(){
  hasAPI('appMeta')
  return await window.appMeta.isDev()
}
