/**
 * SQLite Database Interface
 * Configure, Create, Insert, Update, and Delete
 * 
 * DOCS:
 * SQLite
 * https://www.sqlite.org/lang.html
 * 
 * Response codes: 
 * https://www.sqlite.org/rescode.html
 * 
 * 
 * Node.js
 * https://www.npmjs.com/package/sqlite3
 * https://github.com/TryGhost/node-sqlite3/wiki/API
 * 
 */

const sqlite3 = require('sqlite3').verbose();
const mainUtils = require('./main_utils.js')

let _db = null;


async function connect_db() {
  return new Promise((resolve, reject) => {
    console.log('(I): connect_db()')
    if ( _db == null ) {
      _db = new sqlite3.Database(mainUtils.absFileName(""), (err) => {
        if ( err != null ) {
          return reject(err);
        } else {
          console.log('(I): Connected to DB!')
          return resolve(err);
        }
      });
    } else {
      // TODO: Check for valid DB connection?
      return resolve();
    }
  });
}

/**
 * Re-connect to database (if there's an error)
 */
async function reset_db_connection() {
  return new Promise((resolve, reject) => {
    if ( _db != null ) {
      _db.close((err) => {
        console.error('(E): ', err);
        _db = null;
        if ( err != null ) {
          return reject(err)
        } else {
          _db = new sqlite3.Database(mainUtils.absFileName(""), (err) => {
            if ( err != null ) {
              return reject(err)
            } else {
              return resolve(err)
            }
          })
        }
      })
    } else {
      _db = new sqlite3.Database(mainUtils.absFileName(""), (err) => {
        if ( err != null ) {
          return reject(err)
        } else {
          return resolve(err)
        }
      })
    }
  })
}

// ****** REFERENCE ******
// const TIME_LOG_SCHEMA = {
//   v: STATE_VERSION, 
//   rating: null,
//   onSite: false,
//   timeRecords: [],
//   summary: {
//     start: null,
//     end: null,
//     duration: null,
//     break: null,
//     unknown: null,
//   }
// }

// const EmptyTimeRecord = {
//   id: null,
//   // date: "",
//   start: null,
//   end: null,
//   duration: null,
//   name: "",
//   description: "",
//   categories: [],
//   topic: [],
// }
// ********* END *********

/**
 * Initialize SQLite database tables
 * CAUTION: THIS MUST MATCH THE APP SCHEMA BE CAREFUL WHEN MAKING CHANGES(for now)
 * ^^^ NOT TRUE?
 * FIXME: string replace isn't working for sqlite3 .schema command...
 */
async function init_db_tables() {
  await connect_db()
  const timeRecordSql = 'CREATE TABLE IF NOT EXISTS timeRecord (  \
                           id INT PRIMARY KEY NOT NULL,  \
                           start TEXT,                   \
                           end TEXT,                     \
                           duration TEXT,                \
                           name TEXT,                    \
                           description TEXT,             \
                           categories TEXT,              \
                           topic TEXT                    \
                         )'.replace(/\s+/, ' ');

  const daySummarySql = 'CREATE TABLE IF NOT EXISTS daySummary (  \
                           DAY_SUMMARY TEXT PRIMARY KEY NOT NULL, \
                           v TEXT,          \
                           rating INT,      \
                           onSite BOOLEAN,  \
                           dayStart TEXT,   \
                           dayEnd TEXT,     \
                           duration TEXT,   \
                           break TEXT,      \
                           unknown TEXT     \
                         )'.replace(/\s+/, ' ');

  let errs = []
  await new Promise((resolve, reject) => {
    _db.run(timeRecordSql, (err) => {
      if ( err != null ) { reject(err); }
      else { resolve(); }
    });
  }).catch((err) => { errs.push(err); })
  await new Promise((resolve, reject) => {
    _db.run(daySummarySql, (err) => {
      if ( err != null ) { reject(err); }
      else { resolve(); }
    });
  }).catch((err) => { errs.push(err); })
  await new Promise((resolve, reject) => {
    _db.run(daySummarySql, (err) => {
      if ( err != null ) { reject(err); }
      else { resolve(); }
    });
  }).catch((err) => { errs.push(err); })
  if (errs.length > 0) {
    throw Error(errs)
  }
}

async function insertTimeRecord(timeRecord) {
  await connect_db()
  const insertTimeRecordSql = "INSERT OR REPLACE INTO timeRecord \
                               (id, start, end, duration, name, description, categories, topic) \
                               VALUES \
                               ($id, $start, $end, $duration, $name, $description, $categories, $topic) \
                               ".replace(/\s+/, ' ')

  sqlParams = {
    $id:           timeRecord.id,
    $start:        timeRecord.start,
    $end:          timeRecord.end,
    $duration:     timeRecord.duration,
    $name:         timeRecord.name,
    $description:  timeRecord.description,
    $categories:   timeRecord.categories,
    $topic:        timeRecord.topic,
  }

  await new Promise((resolve, reject) => {
    _db.run(insertTimeRecordSql, sqlParams, (err) => {
      if ( err != null ) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function insertManyTimeRecords(timeRecords) {
  await connect_db()
  console.log('(D): INSERT MANY: ', timeRecords.length, '\n', timeRecords)
  const insertManyTimeRecordsSql = "INSERT OR REPLACE INTO timeRecord \
                                    (id, start, end, duration, name, description, categories, topic) \
                                    VALUES \
                                    ($id, $start, $end, $duration, $name, $description, $categories, $topic) \
                                    ".replace(/\s+/, ' ')

  await new Promise((resolve, reject) => {
    _db.serialize(() => {
      _db.run('BEGIN TRANSACTION')
      timeRecords.map(tr => {
        sqlParams = {
          $id:           tr.id,
          $start:        tr.start,
          $end:          tr.end,
          $duration:     tr.duration,
          $name:         tr.name,
          $description:  tr.description,
          $categories:   tr.categories,
          $topic:        tr.topic,
        }
        _db.run(insertManyTimeRecordsSql, sqlParams)
      })
      _db.run('COMMIT', (err) => {
        if ( err != null ) {
          return reject(err)
        } else {
          return resolve(err)
        }
      })
    })
  })
}

// TODO: USE INSERT OR REPLACE ABOVE INSTEAD OF SEPARATE UPDATE FUNCTION?
// DEPRECATED - DO NOT USE
async function updateTimeRecord(timeRecord) {
  console.warn('(W): updateTimeRecord() - DEPRECATED!!!')
  await connect_db()
  const updateTimeRecordSql = "UPDATE timeRecord \
                               SET (id, start, end, duration, name, description, categories, topic) \
                               = ($id, $start, $end, $duration, $name, $description, $categories, $topic) \
                               WHERE id = $id \
                               ".replace(/\s+/, ' ')

  sqlParams = {
    $id:           timeRecord.id,
    $start:        timeRecord.start,
    $end:          timeRecord.end,
    $duration:     timeRecord.duration,
    $name:         timeRecord.name,
    $description:  timeRecord.description,
    $categories:   timeRecord.categories,
    $topic:        timeRecord.topic,
  }

  await new Promise((resolve, reject) => {
    _db.run(updateTimeRecordSql, sqlParams, (err) => {
      if ( err != null ) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function updateDaySummary(daySummary) {
  await connect_db()
  const updateDaySummarySql = "INSERT OR REPLACE INTO daySummary \
                               (DAY_SUMMARY, v, rating, onSite, dayStart, dayEnd, duration, break, unknown) \
                               VALUES \
                               ('DAY_SUMMARY', $v, $rating, $onSite, $dayStart, $dayEnd, $duration, $break, $unknown) \
                               ".replace(/\s+/, ' ')

  sqlParams = {
    $v:         daySummary.v,
    $rating:    daySummary.rating,
    $onSite:    daySummary.onSite,
    $dayStart:  daySummary.dayStart,
    $dayEnd:    daySummary.dayEnd,
    $duration:  daySummary.duration,
    $break:     daySummary.break,
    $unknown:   daySummary.unknown,
  }

  await new Promise((resolve, reject) => {
    _db.run(updateDaySummarySql, sqlParams, (err) => {
      if ( err != null ) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function loadTimeRecords() {
  await connect_db()
  const selectTimeRecordsSql = "SELECT * FROM timeRecord";
  return await new Promise((resolve, reject) => {
    _db.all(selectTimeRecordsSql, (err, rows) => {
      if ( err != null ) {
        return reject(err)
      } else {
        console.log('(D): loadTimeRecords(): ', rows)
        return resolve(rows)
      }
    })
  })
}

async function loadDaySummary() {
  await connect_db()
  const selectDaySummarySql = "SELECT * FROM daySummary";
  return await new Promise((resolve, reject) => {
    _db.get(selectDaySummarySql, (err, row) => {
      if ( err != null ) {
        reject(err)
      } else {
        console.log('(D): loadDaySummary(): ', row)
        resolve(row)
      }
    })
  })
}

module.exports = {
  init_db_tables: init_db_tables,
  reset_db_connection: reset_db_connection,
  insertTimeRecord: insertTimeRecord,
  insertManyTimeRecords: insertManyTimeRecords,
  updateTimeRecord: updateTimeRecord,
  updateDaySummary: updateDaySummary,
  loadTimeRecords: loadTimeRecords,
  loadDaySummary: loadDaySummary,
}
