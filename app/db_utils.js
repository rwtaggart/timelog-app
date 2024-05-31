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
let _logbook_db = null;

async function __create_db_connection() {
  return new Promise((resolve, reject) => {
    console.log('(D): __create_db_connection()')
    const db_fname = mainUtils.absFileName();
    console.log('(I): Connecting to DB: ', db_fname)
    _db = new sqlite3.Database(db_fname, async (err) => {
      if ( err != null ) {
        return reject(err);
      } else {
        console.log('(I): Connected to DB!')
        return resolve(err);
      }
    });
    _db.on('close', () => {
      console.log('(I): DB connection closed.');
      // _db = null;
    })
  }).then(async () => {
    return await init_db_tables();
  })
}

async function connect_db() {
  // TODO: Rename 'connect_db' => 'connect_log_db'?
  return new Promise((resolve, reject) => {
    console.log('(D): connect_db()')
    if ( _db == null ) {
      return __create_db_connection().then(resolve).catch(reject)
    } else if ( _db.open === true ) {
      if ( _db.filename === mainUtils.absFileName() ) {
        return resolve();
      } else {
        console.log('(D): Attempting to close and connect a new database file.')
        _db.close((err) => {
          if ( err != null ) {
            console.error('(E): Error attempting to close DB: ', err)
            return reject(err);
          }
          _db = null;
          return __create_db_connection().then(resolve).catch(reject)
        });
      }
    } else {
      // SHOULD NOT GET HERE!
      reject('(E): DB connection is in invalid state.')
    }
  });
}

async function __create_logbook_db_connection() {
  return new Promise((resolve, reject) => {
    console.log('(D): __create_db_connection()')
    const logbook_fname = mainUtils.absLogbookFileName();
    console.log('(I): Connecting to DB: ', logbook_fname)
    _logbook_db = new sqlite3.Database(logbook_fname, async (err) => {
      if ( err != null ) {
        return reject(err);
      } else {
        console.log('(I): Connected to DB!')
        return resolve(err);
      }
    });
    _logbook_db.on('close', () => {
      console.log('(I): DB connection closed.');
      // _db = null;
    })
  }).then(async () => {
    return await init_db_tables();
  })
}

async function connect_logbook_db() {
  // TODO: Rename 'connect_db' => 'connect_log_db'?
  return new Promise((resolve, reject) => {
      console.log('(D): connect_db()')
      if ( _logbook_db == null ) {
        return __create_logbook_db_connection().then(resolve).catch(reject)
      } else if ( _logbook_db.open === true ) {
        if ( _logbook_db.filename === mainUtils.absFileName() ) {
          return resolve();
        } else {
          console.log('(D): Attempting to close and connect a new database file.')
          _logbook_db.close((err) => {
            if ( err != null ) {
              console.error('(E): Error attempting to close DB: ', err)
              return reject(err);
            }
            _logbook_db = null;
            return __create_logbook_db_connection().then(resolve).catch(reject)
          });
        }
      } else {
        // SHOULD NOT GET HERE!
        reject('(E): DB connection is in invalid state.')
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
          _db = new sqlite3.Database(mainUtils.absFileName(), (err) => {
            if ( err != null ) {
              return reject(err)
            } else {
              return resolve(err)
            }
          })
        }
      })
    } else {
      _db = new sqlite3.Database(mainUtils.absFileName(), (err) => {
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
  console.log('(D): init_db_tables()');
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

  // TODO: Add support for updating the logbook database and table.
                       //  logId TEXT PRIMARY KEY NOT NULL, \
  const logbookSql = 'CREATE TABLE IF NOT EXISTS logbook (  \
                           getSessionPrefix TEXT, \
                           date TEXT,            \
                           sessionId TEXT,       \
                           fileName TEXT    PRIMARY KEY NOT NULL, \
                           filePath TEXT,         \
                           v TEXT,               \
                           rating INT,           \
                           onSite BOOLEAN,       \
                           dayStart TEXT,        \
                           dayEnd TEXT,          \
                           duration TEXT,        \
                           break TEXT,           \
                           unknown TEXT          \
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
    _logbook_db.run(logbookSql, (err) => {
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
  console.log('(D): timeRecord: INSERT ONE: ', '\n', timeRecord)
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
  console.log('(D): timeRecords: INSERT MANY: ', timeRecords.length, '\n', timeRecords)
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
  await connect_db();
  console.log('(D): daySummary: INSERT ONE: ', '\n', daySummary)
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

  // TODO: Add support for updating the logbook record.
  await connect_logbook_db();
  console.log('(D): logbook: INSERT ONE: ');
  const updateLogbookSql = "INSERT OR REPLACE INTO logbook \
                               (getSessionPrefix, date, sessionId, fileName, filePath, v, rating, onSite, dayStart, dayEnd, duration, break, unknown) \
                               VALUES \
                               ($getSessionPrefix, $date, $sessionId, $fileName, $filePath, $v, $rating, $onSite, $dayStart, $dayEnd, $duration, $break, $unknown) \
                               ".replace(/\s+/, ' ')

  const logId = 
  sqlParams = {
    $getSessionPrefix:  mainUtils.getSessionPrefix(),
    $date:             mainUtils.dateFileFmt(mainUtils.getSessionDate()),
    $sessionId:        mainUtils.getSessionId(),
    $fileName:          mainUtils.fileName(mainUtils.getSessionDate()),
    $filePath:          mainUtils.absFileName(),
    $v:                daySummary.v,
    $rating:           daySummary.rating,
    $onSite:           daySummary.onSite,
    $dayStart:         daySummary.dayStart,
    $dayEnd:           daySummary.dayEnd,
    $duration:         daySummary.duration,
    $break:            daySummary.break,
    $unknown:          daySummary.unknown,
  }

  await new Promise((resolve, reject) => {
    _logbook_db.run(updateLogbookSql, sqlParams, (err) => {
      if ( err != null ) {
        reject(err)
      } else {
        resolve()
      }
    })
  })

  // TODO: Add support for updating the logbook record.

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
  connect_db: connect_db,
  connect_logbook_db: connect_logbook_db,
  init_db_tables: init_db_tables,
  reset_db_connection: reset_db_connection,
  insertTimeRecord: insertTimeRecord,
  insertManyTimeRecords: insertManyTimeRecords,
  updateTimeRecord: updateTimeRecord,
  updateDaySummary: updateDaySummary,
  loadTimeRecords: loadTimeRecords,
  loadDaySummary: loadDaySummary,
}
