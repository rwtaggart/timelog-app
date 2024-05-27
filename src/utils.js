/**
 * Utility Methods
 * TODO: split into:
 *  - dt_utils.js -- for DateTime utilities
 *  - ds_api.js     -- for API calls and stuff
 */

/* TIME & DATE UTILS */
import { format, parse, add, differenceInMilliseconds } from 'date-fns'
import addTime from 'date-fns/add'
import intervalToDuration from 'date-fns/intervalToDuration'
import areIntervalsOverlapping from 'date-fns/areIntervalsOverlapping'

// DEPRECATED: date-fns => dayjs
// TODO: Replace current date-fns utility functions with dayjs_utils.js functions

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

// export function elapsed(ms) {
//   // def elapsed(t): 
//     return str(int(math.floor(t / 3600))) + 'h ' + str(int(math.floor(t % 3600 / 60))) + 'm ' + str(round(t % 3600 % 60, 3)) + 's'
// }

export function milliDurationFmt(ms) {
  //     return str(int(math.floor(t / 3600))) + 'h ' + str(int(math.floor(t % 3600 / 60))) + 'm ' + str(round(t % 3600 % 60, 3)) + 's'
  const ts = ms / 1000
  const h = Math.floor(ts / 3600)
  const m = Math.floor(ts % 3600 / 60)
  const s = Math.floor(ts % 3600 % 60)
  let fmt = ""
  if (h > 0) {
    fmt += h + 'h '
  }
  if (m > 0) {
    fmt += m + 'm '
  }
  if (s > 0) {
    fmt += s + 's '
  }
  return fmt
}

const zeroDuration = { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, }
export function sumDuration(timeRecords, category) {
  let cumDuration = 0
  for (let record of timeRecords) {
    // const dur = intervalToDuration({
    //   start: parseDateTime(record.date, record.start), 
    //   end: parseDateTime(record.date, record.end)
    // })
    if (record.categories.indexOf(category) >= 0) {
      cumDuration += differenceInMilliseconds(
        parseDateTime(record.date, record.end),
        parseDateTime(record.date, record.start),
      )
    }
  }

  return cumDuration
}

// export function sumUnknownDuration(timeRecords) {
//   let cumDuration = 0
//   for (let record of timeRecords) {
//     // const dur = intervalToDuration({
//     //   start: parseDateTime(record.date, record.start), 
//     //   end: parseDateTime(record.date, record.end)
//     // })
//     if (record.categories.indexOf(category) >= 0) {
//       cumDuration += differenceInMilliseconds(
//         parseDateTime(record.date, record.end),
//         parseDateTime(record.date, record.start),
//       )
//     }
//   }

//   return cumDuration
// }

export function durationFmt(dateStr, startStr, endStr) {
  // console.log("(D): durationFmt: ", dateStr, startStr, endStr)
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
    // Assume no overlap if there's an error
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
  console.warn('(W): NO LONGER SUPPORTED!')
  hasAPI('dataStore')
  await window.dataStore.writeAllTimeRecords(data.timeRecords)
  await window.dataStore.writeDaySummary(data.daySummary)
}

export async function loadData(session_id) {
  console.log('(D): loadData session_id: ', typeof session_id)
  console.warn('(E): NO LONGER SUPPORTED!')
  // hasAPI('dataStore')
  // return await window.dataStore.load(session_id)
}

export async function writeTimeRecord(session_id) {
  console.log('(D): writeTimeRecord session_id: ', typeof session_id)
  hasAPI('dataStore')
  return await window.dataStore.writeTimeRecord(session_id)
}
export async function writeDaySummary(session_id) {
  console.log('(D): writeDaySummary session_id: ', typeof session_id)
  hasAPI('dataStore')
  return await window.dataStore.writeDaySummary(session_id)
}

export async function loadTimeRecords(session_id) {
  console.log('(D): loadTimeRecords session_id: ', typeof session_id)
  hasAPI('dataStore')
  return await window.dataStore.loadTimeRecords(session_id)
}

export async function loadDaySummary(session_id) {
  console.log('(D): loadDaySummary session_id: ', typeof session_id)
  hasAPI('dataStore')
  return await window.dataStore.loadDaySummary(session_id)
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

export async function absFileName(session_id) {
  try {
    hasAPI('config')
    return await window.config.absFileName(session_id)
  } catch (e) {
    console.log('(E): ', e)
  }
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
