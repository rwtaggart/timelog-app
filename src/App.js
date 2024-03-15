import React, { useState, useReducer, useEffect } from 'react';
import './App.css';

import isBefore from 'date-fns/isBefore';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
// import Tooltip from '@mui/material/Tooltip';
// import IconButton from '@mui/material/IconButton';
// import CopyIcon from '@mui/icons-material/ContentCopy';
import ReplayIcon from '@mui/icons-material/Replay';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import GridOnIcon from '@mui/icons-material/GridOn';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import TableChartIcon from '@mui/icons-material/TableChart';

import GitHubIcon from '@mui/icons-material/GitHub';
import { parseDateTime, writeData, loadData, loadCfgCategories, editCfgCategories, absFileName, isDev as isDevFnc} from './utils.js';

import { dayjs, dateFmt, timeFmt, sumDuration, sumUnknownDuration, diffDurationFmt, durationFmt } from './dayjs_utils.js';

// isDev as isDevFnc

import { categories } from './constants.js';
import { ViewTimeLogTable, EditTimeBlock } from './TimeBlock.js';
import { DayRatingGroup, customRatingIcons } from './DayRating.js';

// TODO: rename 'timeslog' => 'timeRecords'; REQUIRES SCHEMA COMPATIBILITY UPDATE
const STATE_VERSION = "0.4.0"

// TODO: Where does this spec. belong?
// const TIME_RECORD_SCHEMA = {
//   start,
//   end,
// }

const TIME_LOG_SCHEMA = {
  v: STATE_VERSION, 
  rating: null,
  timeRecords: [],
  summary: {
    start: null,
    end: null,
    duration: null,
    break: null,
    unknown: null,
  }
}

/** 
 * Serialize dayjs objects into ISO strings.
 * FIXME: The "default" JSON.stringify() behavior doesn't appear to work as expected with electron...
 */
function formatAndWriteData(session_id, timelog) {
  let fmtTimeLog = { ...timelog }
  fmtTimeLog.timeRecords = timelog.timeRecords.map(record => {
    let o = {...record, start: record.start.toISOString(), end: record.end.toISOString()}
    delete o['date']
    return o
  })
  writeData(session_id, fmtTimeLog)
}

function parseDateDataV2or3(timeRecords) {
  function parseDatev2or3(dateStr, timeStr) {
    let date = dayjs(dateStr.slice(5, dateStr.length).replace('.', '-'), 'MMM- DD', true)
    let time = dayjs(timeStr, 'h:mma', true)
    let modDate = date.hour(time.hour())
    modDate = modDate.minute(time.minute())
    return modDate
  }
  return timeRecords.map(record => {
    return {
      ...record,
      start: parseDatev2or3(record.date, record.start),
      end: parseDatev2or3(record.date, record.end),
    }
  })
}

function parseDateData(timeRecords) {
  return timeRecords.map(record => ({...record, start: dayjs(record.start), end: dayjs(record.end)}))
}

function sortAndWriteTimesLog(session_id, prevTimeLog, modTimeRecords) {
  modTimeRecords.sort((a, b) => ( a.start.isBefore(b.start) ? -1 : 1 ))
  // modTimeRecords.sort((a, b) => (
  //   isBefore(
  //     parseDateTime(a.date, a.start), 
  //     parseDateTime(b.date, b.start)
  //   ) ? -1 : 1
  // ))
  // TODO: Store entire "state" persistently with useReducer() above... ?
  const beginRecord = modTimeRecords.at(0)
  const endRecord = modTimeRecords.at(-1)
  const modTimeLog = {
    ...prevTimeLog,
    summary: {
      date: dateFmt(beginRecord.start),
      start: beginRecord != null ? timeFmt(beginRecord.start) : null,
      end: endRecord != null ? timeFmt(endRecord.end) : null,
      duration: diffDurationFmt(beginRecord.start, endRecord.end),
      break: durationFmt(sumDuration(modTimeRecords, 'Break')),
      active: durationFmt(dayjs.duration(endRecord.end.diff(beginRecord.start)).subtract(sumDuration(modTimeRecords, 'Break'))),
      unknown: durationFmt(sumUnknownDuration(modTimeRecords)),
    },
    timeRecords: modTimeRecords,
  }
  formatAndWriteData(session_id, modTimeLog)  // Question: Stuff this in the action "event handler" ? => no.
  return modTimeLog
}

function timeLogReducer(prevTimeLog, action) {
  switch(action.type) {
    case "ModifyDayRating": {
      let modTimeLog = {
        ...prevTimeLog,
        rating: action.rating,
        timeRecords: [...prevTimeLog.timeRecords],
      }
      formatAndWriteData(action.session_id, modTimeLog)
      return modTimeLog
    }
    case "AddTimeRecord": {
      const updateTimesLog = [...prevTimeLog.timeRecords, action.timeRecord]
      return sortAndWriteTimesLog(action.session_id, prevTimeLog, updateTimesLog)
    }
    case "ChangeTimeRecord": {
      const updateTimesLog = prevTimeLog.timeRecords.map((timeRecord) => (timeRecord.id === action.timeRecord.id) ? action.timeRecord : timeRecord)
      return sortAndWriteTimesLog(action.session_id, prevTimeLog, updateTimesLog)
    }
    case "DeleteTimeRecord": {
      const updateTimesLog = prevTimeLog.timeRecords.filter(timeRecord => (timeRecord.id !== action.timeRecordId))
      return sortAndWriteTimesLog(action.session_id, prevTimeLog, updateTimesLog)
    }
    case "CancelChangeTimeRecord": {
      return prevTimeLog
    }
    case "ReloadTimeLog": {
      return action.timeLogData
    }
    default: {
      throw Error('Action not supported: ' + action.type)
    }
  }
}

function timeRecordsMaxId (accumulator, current) {
  return Math.max(accumulator, current.id)
}

function App() {
  /** TODO: Move all "show" boolean settings into a single object **/
  // TODO: Use a reducer for the "config" app state (isDev, isShowSettings, editMode, cfgCategories, etc.)
  const [ isDev, setIsDev ] = useState(false)
  const [ isShowSettings, setIsShowSettings ] = useState(false)
  const [ isShowTodo, setIsShowToDo ] = useState(false)
  const [ session_id, setSessionId ] = useState("")  // TODO: Add session_id to timeLogReducer? => yes.
  const [ timeLogDir, setTimeLogDir ] = useState("")  // TODO: Add session_id to timeLogReducer? => yes.
  const [ editMode, setEditMode ] = useState("view")
  const [ showEditModeSw, setShowEditModeSw ] = useState(false)
  // const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  
  // DEPRECATED - TAKE OUT:
  // const [ timesLog, settimesLog ] = useState([])   // QUESTION: useReducer() instead?
  // const [ dayRating, setDayRating ] = useState(0)  // TODO: combine with timesLog and STATE_VERSION

  // TODO: rename to dispatchTimeLogAction ?
  const [ nextTimeRecordId, setNextTimeRecordId ] = useState(0)  // TODO: TAKE OUT - no longer needed.
  const [ editableTimeRecordIds, setEditableTimeRecordIds ] = useState([])
  const [ editTimeGapRecords, setEditTimeGapRecords ] = useState([])
  const [ timeLog, dispatchTimeLog ] = useReducer(timeLogReducer, TIME_LOG_SCHEMA)

  // timeLog.break = sumDuration(timeLog, 'Break')

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  useEffect(() => {
    // Load the config categories once on initial render (with no dependencies)
    // TODO: Add other initializations
    //    Load isDev flag
    //    Load data
    async function loadAndSetInitialStates () { 
      loadCfgCategories().then(v => { if (v != null) { setCfgCategories(v)} })
      isDevFnc().then(v => setIsDev(v))
      absFileName(session_id != null ? session_id : "").then(path => setTimeLogDir(path))
      handleReloadData()
    }
    loadAndSetInitialStates()
    return
  }, [])
  console.log('(D): cfgCategories: ' + JSON.stringify(cfgCategories))  // Note: this may not properly reflect the "actual" state

  const handleTimeRecordEvent = (action) => {
    console.log('(D): handleTimeRecordEvent(): ', action.type)
    if (action.type == "AddTimeRecord") {
      // QUESTION: Does this belong in the "state" reducer?
      setNextTimeRecordId(nextTimeRecordId + 1)
      // TODO: Add 'editMode' to 'timeLogReducer()' ? => no.
      if (editMode != 'bulk edit') {
        setEditMode("view")
      }
    }
    if (action.type === "ChangeTimeRecord" || action.type === "CancelChangeTimeRecord") {
      // QUESTION: Does this belong in the "state" reducer?
      // Remove this record from the list of "editable" records.
      setEditableTimeRecordIds(editableTimeRecordIds.filter((id) => (id !== action.timeRecordId && id !== action.timeRecord.id)))
    }
    dispatchTimeLog({...action, session_id: session_id})
  }
  // const addTimeRecord = (timeRecord) => {
  //   // DEPRECATED: replace with handleTimeRecordEvent()
  //   settimesLog(prevTimesLog => {
  //     const updateTimesLog = [...prevTimesLog, timeRecord]
  //     updateTimesLog.sort((a, b) => (
  //       isBefore(
  //         parseDateTime(a.date, a.start), 
  //         parseDateTime(b.date, b.start)
  //       ) ? -1 : 1
  //     ))
  //     // TODO: Store entire "state" persistently with useReducer() above...
  //     const state = {
  //       v: STATE_VERSION,
  //       rating: dayRating,
  //       timeslog: updateTimesLog
  //     }
  //     writeData(session_id, state)
  //     return updateTimesLog
  //   })
  //   // TODO: Add 'editMode' to 'timeLogReducer()' ? => no.
  //   if (editMode != 'bulk edit') {
  //     setEditMode("view")
  //   }
  // }

  const handleSetTimeRecordEditMode = (timeRecordId) => {
    // TODO: Rename to handleAddEditableTimeRecord() ?
    setEditableTimeRecordIds([...editableTimeRecordIds, timeRecordId])
  }

  // TODO: Add Save button and key binding
  // const handleWriteData = async (e) => {
  //   console.log('(D): handleWriteData: ', JSON.stringify(timesLog))
  //   let rc = await writeData(session_id, timesLog)
  //   console.log('writeData rc=', rc)
  // }

  const handleReloadData = async (e) => {
    // TODO: use dispatchTimeLog() instead of setTimesLog() and setDayRating()
    const data = await loadData(session_id)
    if (data == null) {
      console.log('(D): loadData() returned null')
      return
    }
    console.log('(D): handleReloadData: ', `${data.length}`, `${data}`)
    // FIXME: handle multiple versions of data...
    // TODO: Handle this in the utils.js "api" part...
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        // OLD - deprecated. TODO: TAKE OUT.
        // settimesLog(data)
        setNextTimeRecordId(data.reduce(timeRecordsMaxId, 0) + 1)
        dispatchTimeLog({
          type: "ReloadTimeLog_v0.1.0",
          timeslogArray: data,
        })
      } else if (data && (data.v === "0.2.0" || data.v === "0.3.0")) {
        // TODO: Fix the "rating" from [1,3] to [-2,+2] scale.
        // setDayRating(data.rating)
        // settimesLog(data.timeslog)
        console.log('(D): Loading older version of data.')
        setNextTimeRecordId(data.timeslog.reduce(timeRecordsMaxId, 0) + 1)
        data.timeRecords = parseDateDataV2or3(data.timeslog)
        const beginRecord = data.timeRecords.at(0)
        const endRecord = data.timeRecords.at(-1)
        data.summary = {
          date: dateFmt(beginRecord.start),
          start: beginRecord != null ? timeFmt(beginRecord.start) : null,
          end: endRecord != null ? timeFmt(endRecord.end) : null,
          duration: diffDurationFmt(beginRecord.start, beginRecord.end),
          break: null,
          unknown: null,
        }
        console.log('(D): timeRecords: ', data.timeRecords)
        dispatchTimeLog({
          type: "ReloadTimeLog",
          timeLogData: data,
        })
      } else if (data && data.v === "0.4.0") {
        setNextTimeRecordId(data.timeRecords.reduce(timeRecordsMaxId, 0) + 1)
        data.timeRecords = parseDateData(data.timeRecords)
        dispatchTimeLog({
          type: "ReloadTimeLog",
          timeLogData: data,
        })
      } else {
        throw Error("Unable to load data - version mismatch")
      }
    } else {
      throw Error("Unable to load data")
    }
  }

  const handleReloadCfgCategories = async (e) => {
    const data = await loadCfgCategories()
    console.log('(D): handleReloadCfgCategories: ', `${data.length}`, `${data}`)
    setCfgCategories(data)
  }

  const handleEditCfgCategories = async (e) => {
    editCfgCategories()
    // console.log('(D): handleEditCfgCategories: ', `${data.length}`, `${data}`)
    // setCfgCategories(data)
  }

  const handleKeyPress = (e) => {
    if (editableTimeRecordIds.length > 0 || editTimeGapRecords.length > 0) { return }
    if (e.key === 'Escape') {
      setEditMode("view")
    }
    if (editMode != 'view') { return }
    if (e.key === 'e') {
      setEditMode("single edit")
      e.preventDefault()
    }
    if (e.key === 'b') {
      setEditMode("bulk edit")
      e.preventDefault()
    }
  }

  const handleDayRatingEvent = (rating) => {
    dispatchTimeLog({
      type: "ModifyDayRating",
      session_id: session_id,
      rating: rating,
    })
  }

  // useEffect(() => {
  //   // Store state to disk upon changes
  //   // FIXME: THIS RUNS EVERY TIME AND WILL OVERWRITE VALID FILES.
  //   writeData(session_id, timeLog)
  // }, [session_id, timeLog])

  useEffect(() => {
    /** Handle Key Bindings */
    document.addEventListener("keydown", handleKeyPress)
    console.log('(D): mount component!')
    return function cleanup() {
      console.log('(D): unmount component!')
      document.removeEventListener("keydown", handleKeyPress)
    }
  })


  return (
    <div className="App">
      <header className="app-header">
      <ThemeProvider theme={darkTheme}>
          {/* TODO: Create a separate "header" component */}
          <CssBaseline />
          <Stack direction="row" spacing={{ xs: 4, sm: 10, md: 20 }}>
            <div>
              <span className="app-title">Time Log</span>
              {/* TODO: Only render "TEST MODE" in "dev" mode!!! */}
              {isDev && 
                <>
                  &nbsp; &nbsp; <span style={{"color":"orange"}}>DEV MODE</span>
                </>
              }
            </div>
            <FormControl>
              <Stack direction="row" spacing={1}>
                <FormLabel onClick={() => setShowEditModeSw(prevFlag => !prevFlag)}>{editMode === "view" ? "View" : "Edit"} Mode:</FormLabel>
                {showEditModeSw || 
                  <>
                    {editMode == "view"        && <TableChartIcon />}
                    {editMode == "single edit" && <EditIcon />}
                    {editMode == "bulk edit"   && <RepeatOnIcon />}
                  </>
                }
              </Stack>
              { showEditModeSw &&
                <RadioGroup row
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value)}
                  >
                    <FormControlLabel value="view"        control={<Radio />} label="view"        />
                    <FormControlLabel value="single edit" control={<Radio />} label="single edit" />
                    <FormControlLabel value="bulk edit"   control={<Radio />} label="bulk edit"   />
                  </RadioGroup>
              }
            </FormControl>
            {/* <Button onClick={handleWriteData}>STORE DATA</Button> */}
            <Box>
              <Tooltip title="Reload Data">
                <IconButton onClick={handleReloadData}>
                  <ReplayIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton onClick={() => setIsShowSettings(prevFlag => !prevFlag)}>
                  {/* FIX ME: Color switch not working... ? */}
                  {/* <SettingsIcon color={ isShowSettings ? "action" : "secondary" } /> */}
                  <SettingsIcon color="" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
          <DayRatingGroup rating={timeLog.rating} handleDayRatingEvent={handleDayRatingEvent} />
          {/* <GitHubIcon onClick={e =>  window.location.href=''} /> */}
          {/* <span fixme="hack: why do we need this ??"/> */}
        </ThemeProvider>
      </header>
      <main className="app-content">
      <ThemeProvider theme={darkTheme}>
        {/* TODO: Create separate Settings component */}
        {isShowSettings &&
          <>
            <Stack direction="row" spacing={2}>
              <Button onClick={handleReloadCfgCategories}>
                <ReplayIcon />
                Reload Categories
              </Button>
              <Button onClick={handleEditCfgCategories}>
                <EditIcon />
                Edit Categories
              </Button>
              <FormControl id="settings-form">
                <TextField
                    // error={ errors.start }
                    id="standard-basic"
                    variant="standard"
                    label="Session ID"  
                    value={session_id}
                    // FIXME: this doesn't appear to work as expected
                    onChange={(e) => {setSessionId(e.target.value); absFileName(e.target.value != null ? e.target.value : "").then(path => setTimeLogDir(path))}}
                    // onKeyPress={handleKeyPress}
                    // onBlur={(e) => setSessionId(e.target.value)}
                    // helperText="mm:ss (am/pm)"
                  />
              </FormControl>
            </Stack>
            <Typography><b>TimeLog Output Dir:</b> <code>{JSON.stringify(timeLogDir)}</code></Typography>
          </>
        }
        <br />
        {/* <Stack direction="row" spacing={5} justifyContent="center" alignItems="center"> */}
        <Stack direction="row" spacing={5} justifyContent="center" alignItems="center" className="summary-content">
          <Typography><b>Start:</b> {timeLog.summary.start}</Typography>
          <Typography><b>End:</b> {timeLog.summary.end}</Typography>
          <Typography><b>Duration:</b> <span className="right">{timeLog.summary.duration}</span></Typography>
          <Typography><b>Active:</b> <span className="right">{timeLog.summary.active}</span></Typography>
          <Typography><b>Break:</b> <span className="right">{timeLog.summary.break}</span></Typography>
          <Typography><b>Unknown:</b> <span className="right">{timeLog.summary.unknown}</span></Typography>
          {/* ACTIVE: Break & Unknown "labels" */}
        </Stack>
          <ViewTimeLogTable 
            log={timeLog.timeRecords} 
            editableTimeRecordIds={editableTimeRecordIds}
            nextTimeRecordId={nextTimeRecordId}
            handleTimeRecordEvent={handleTimeRecordEvent}
            handleSetTimeRecordEditMode={handleSetTimeRecordEditMode}
            editTimeGapRecords={editTimeGapRecords} setEditTimeGapRecords={setEditTimeGapRecords}
            cfgCategories={cfgCategories}
          />
        <br />
        { editMode != 'view'
          ? (<div className="highlight-edit">
            <EditTimeBlock
                key={timeLog.timeRecords.length}
                timeLog={timeLog}
                // addTimeRecord={addTimeRecord}
                handleTimeRecordEvent={handleTimeRecordEvent}
                submitAction="AddTimeRecord"
                timeRecordId={nextTimeRecordId}
                initTimeRecord={timeLog.timeRecords.length > 0 ? timeLog.timeRecords[timeLog.timeRecords.length - 1] : null}
                cfgCategories={cfgCategories}
             />
             </div>
          ) : (
            <></>
            // <Stack direction="row" justifyContent="center">
            // <div className="app-margin-left">
            //   <Tooltip title="Add">
            //     <Button onClick={() => setEditMode("single edit")} sx={{color: grey[300]}}>
            //       <Stack direction="row" spacing={2} alignItems="center">
            //         <AddCircleIcon />
            //         <Typography>Add Record</Typography>
            //         {/* Add Record */}
            //       </Stack>
            //     </Button>
            //   </Tooltip>
            // </div>
            // </Stack>
          )
        }
        <br />
        {/* <div> */}
        {/* <h1>State:</h1> */}
        {/* <span>{JSON.stringify(timeLog)}</span> */}
        {/* </div> */}
      </ThemeProvider>
      </main>
    </div>
  );
}

export default App;
