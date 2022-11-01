/**
 * Utility Methods
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

export async function writeData(session_id, data) {
  if ( !window.dataStore ) {
    throw new ElectronError('Electron APIs are not available!')
  }
  return await window.dataStore.write(session_id, data)
}
