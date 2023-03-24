/**
 * Utility Methods
 * TODO: split into:
 *  - dtutils.js -- for DateTime utilities
 *  - api.js     -- for API calls and stuff
 */

/* TIME & DATE UTILS */
import { format, parse } from 'date-fns'
import addTime from 'date-fns/add'
import intervalToDuration from 'date-fns/intervalToDuration'
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping'

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

export function durationFmt(dateStr, startStr, endStr) {
  console.log("(D): durationFmt: ", dateStr, startStr, endStr)
  try {
    const dur = intervalToDuration({
      start: parseDateTime(dateStr, startStr), 
      end: parseDateTime(dateStr, endStr)
    })
    return Object.keys(dur).map(k => dur[k] > 0 ? `${dur[k]}${k[0]}` : '').join(' ').trim()
  } catch (e) {
    console.warn('(W): Parsed invalid time format: ', e)
    return null;
  }
}

export function fuzzyIntervalOverlap(a, b) {
  if (a == null || b == null 
    || a.start == null || b.start == null
    || a.end == null || b.end == null) {
    return false
  }
  try {
    let afuzzy = {
      start: addTime(parseDateTime(a.date, a.start), {seconds: -10}),
      end: addTime(parseDateTime(a.date,a.end), {seconds: 10}),
    }
    let bfuzzy = {
      start: addTime(parseDateTime(b.date, b.start), {seconds: -10}),
      end: addTime(parseDateTime(b.date, b.end), {seconds: 10}),
    }
    return areIntervalsOverlapping(afuzzy, bfuzzy)
  } catch (e) {
    console.warn('(W): Invalid Intervals: ', a, b)
    return false
  }
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

export async function loadCfgCategories() {
  hasAPI('config')
  let cfgs = await window.config.categories.load()
  console.log("loadCfgCategories: " + JSON.stringify(cfgs))  // TODO: TAKE OUT?
  return cfgs
}

export async function editCfgCategories() {
  hasAPI('config')
  return await window.config.categories.edit()
}

export async function isDev(){
  hasAPI('appMeta')
  return await window.appMeta.isDev()
}

export function parseVersion(v) {
  /** Use Semantic Versioning */
  const labels = ['major', 'minor', 'patch']
  const semver = v.split('.').map(i => parseInt(i))
  return labels.reduce((o, l, idx) => {o[l]=semver[idx]; return o}, {})
}
