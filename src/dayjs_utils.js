/**
 * dayjs utility functions
 * 
 * ISO 8601 Format Required for dayjs string constructors
 * See: https://day.js.org/docs/en/parse/string
 * const [ start, end ] = [dayjs('2023-10-01'), dayjs('2024-12-01')]
 * 
 * Use String + Format with CustomParseFormat for alternate parsing options
 */

import dayjs_lib from 'dayjs'
import duration from 'dayjs/plugin/duration'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs_lib.extend(duration)
dayjs_lib.extend(customParseFormat)
dayjs_lib.extend(isSameOrBefore)

export const dayjs = dayjs_lib

window.dayjs = dayjs

export function checkDayjs(datetime) {
  if ( datetime instanceof dayjs && datetime.isValid() ) {
    return true
  } else {
    console.warn('(W): Invalid dayjs object: ', datetime)
    throw Error('Invalid dayjs object')
  }
}


export function dateFmt(date) {
  if (date == null) {
    return ""
  } else if ( typeof date === 'string' ) {
    return date
  }
  try {
    checkDayjs(date)
    return date.format('ddd. MMM. D')
  } catch (e) {
    return "Invalid Date"
  }
}


export function timeFmt(time) {
  // console.log('(D): timeFmt: ', time, typeof time)
  if (time == null) {
    return ""
  } else if ( typeof time === 'string' ) {
    return time
  }
  try {
    checkDayjs(time)
    return time.format('h:mma')
  } catch (e) {
    return "Invalid Time"
  }
  // if (time instanceof Date && !isNaN(time))
  //   return format(time, 'h:mmaaa')
  // else
  //   return "Invalid Time"
}


export function parseDate(dateStr, strict = false) {
  // s.slice(5, s.length)
  console.log('parseDate: strict=', strict)
  if ( !strict && (dateStr == null || dateStr === "") ) {
    return null
  }
  return dayjs(dateStr.slice(5, dateStr.length), 'MMM. D', true)
  // return dayjs(dateStr, 'MMM. dd', new Date())
}


// export function parseDateTime(dateStr, timeStr) {
//   return parse(dateStr + ' ' + timeStr, 'EEE, MMM. dd h:mmaaa', new Date())
// }


export function parseTime(timeStr, strict = false) {
  // console.log('parseTime: strict=', strict)
  if ( !strict && (timeStr == null || timeStr === "") ) {
    return null
  }
  return dayjs(timeStr, 'h:mma', true)
}


/**
 * Custom duration format for dayjs
 * start: dayjs
 * end: dayjs
 */
export function durationFmt(start, end) {
  if ( start == null || end == null ) {
    return ""
  }
  try {
    if ( !checkDayjs(start) || !checkDayjs(end) || end.isBefore(start, 'minute') ) {
      console.warn('(W): start must pre-date end: ', start, end)
      throw Error('Start must pre-date end', start, end)
    }
    const dur = dayjs.duration(end.diff(start))
    console.log('(D): durationFmt: ', dur)

    let minutes = dur.minutes() + (dur.seconds() > 0 ? 1 : 0)
    let hours = dur.hours()
    if (minutes > 59) {
      hours +=1
      minutes = 0
    }

    let s = []
    if (hours > 0) {
      s.push('' + hours + 'h')
    }
    if (minutes > 0) {
      s.push('' + minutes + 'm')
    }
    return s.join(' ')
  } catch(e) {
    console.warn('(W): caught error: ', e)
   return "Invalid Duration" 
  }
}


/**
 * Fuzzy overlap for dayjs
 * "Fuzzy" means that touching boundaries are considered to be "overlapping."
 */
export function fuzzyIntervalOverlap(a, b) {
  if ( !(
       checkDayjs(a.start) 
    && checkDayjs(a.end) 
    && checkDayjs(b.start) 
    && checkDayjs(b.end)
    ) ) {
      return false
  }
  try {
    if ( a.end.isBefore(a.start, 'minute') || b.end.isBefore(b.start, 'minute') ) {
      throw new Error('end must occur after start', a, b)
    }
    if ( a.start.isSame(b.end, 'minute') || a.end.isSame(b.start, 'minute') ) {
      // If the boundaries are "touching" then there is an "overlap"
      return true
    }
    return    (a.start.isAfter(b.start, 'minute') && a.start.isBefore(b.end, 'minute'))
           || (b.start.isBefore(a.end, 'minute') && b.end.isAfter(a.end, 'minute') )
  } catch (e) {
    // Assume no overlap if there's an error
    console.warn('(W): Invalid Intervals: ', a, b)
    return false
  }
}

