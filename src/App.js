import React, { useState, useReducer, useEffect } from 'react';
import './App.css';

import isBefore from 'date-fns/isBefore';

import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import { parseDateTime, parseTime, parseDate, dateFmt, timeFmt, writeData, loadData, loadCfgCategories, editCfgCategories, initCategories, isDev as isDevFnc} from './utils.js';
// isDev as isDevFnc

import { categories } from './constants.js';
import { ViewTimeLogTable, EditTimeBlock } from './TimeBlock.js';
import { DayRatingGroup, customRatingIcons } from './DayRating.js';

// TODO: rename 'timeslog' => 'timeRecords'; REQUIRES SCHEMA COMPATIBILITY UPDATE
const STATE_VERSION = "0.2.0"
const TIME_LOG_SCHEMA = {
  v: STATE_VERSION, 
  rating: 0, 
  timeslog: []
}

function sortAndWriteTimesLog(session_id, prevTimeLog, modTimeRecords) {
  modTimeRecords.sort((a, b) => (
    isBefore(
      parseDateTime(a.date, a.start), 
      parseDateTime(b.date, b.start)
    ) ? -1 : 1
  ))
  // TODO: Store entire "state" persistently with useReducer() above... ?
  const modTimeLog = {
    ...prevTimeLog,
    timeslog: modTimeRecords,
  }
  writeData(session_id, modTimeLog)  // Question: Stuff this in the action "event handler" ? => no.
  return modTimeLog
}

function timeLogReducer(prevTimeLog, action) {
  switch(action.type) {
    case "ModifyDayRating": {
      let modTimeLog = {
        ...prevTimeLog,
        rating: action.rating,
        timeslog: [...prevTimeLog.timeslog],
      }
      writeData(action.session_id, modTimeLog)
      return modTimeLog
    }
    case "AddTimeRecord": {
      const updateTimesLog = [...prevTimeLog.timeslog, action.timeRecord]
      return sortAndWriteTimesLog(action.session_id, prevTimeLog, updateTimesLog)
    }
    case "ChangeTimeRecord": {
      const updateTimesLog = prevTimeLog.timeslog.map((timeRecord) => (timeRecord.id === action.timeRecord.id) ? action.timeRecord : timeRecord)
      return sortAndWriteTimesLog(action.session_id, prevTimeLog, updateTimesLog)
    }
    case "DeleteTimeRecord": {
      const updateTimesLog = prevTimeLog.timeslog.filter(timeRecord => (timeRecord.id !== action.timeRecordId))
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
  const [ isDev, setIsDev ] = useState(false)
  const [ isShowSettings, setIsShowSettings ] = useState(false)
  const [ isShowTodo, setIsShowToDo ] = useState(false)
  const [ session_id, setSessionId ] = useState("")  // TODO: Add session_id to timeLogReducer? => yes.
  const [ editMode, setEditMode ] = useState("view")
  const [ showEditModeSw, setShowEditModeSw ] = useState(false)
  // const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  
  // DEPRECATED - TAKE OUT:
  // const [ timesLog, settimesLog ] = useState([])   // QUESTION: useReducer() instead?
  // const [ dayRating, setDayRating ] = useState(0)  // TODO: combine with timesLog and STATE_VERSION

  // TODO: rename to dispatchTimeLogAction ?
  const [ nextTimeRecordId, setNextTimeRecordId ] = useState(0)
  const [ editableTimeRecordIds, setEditableTimeRecordIds ] = useState([])
  const [ timeLog, dispatchTimeLog ] = useReducer(timeLogReducer, TIME_LOG_SCHEMA)

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
      setEditableTimeRecordIds(editableTimeRecordIds.filter((id) => id !== action.timeRecordId))
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
      } else if (data && data.v === "0.2.0") {
        // TODO: Support multiple versions ?
        // setDayRating(data.rating)
        // settimesLog(data.timeslog)
        setNextTimeRecordId(data.timeslog.reduce(timeRecordsMaxId, 0) + 1)
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
    console.log('(D): Key=', e.key)
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
                <FormLabel onClick={() => setShowEditModeSw(prevFlag => !prevFlag)}>View Mode:</FormLabel>
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
                  onChange={(e) => {setSessionId(e.target.value)}}
                  // onKeyPress={handleKeyPress}
                  // onBlur={(e) => setSessionId(e.target.value)}
                  // helperText="mm:ss (am/pm)"
                />
            </FormControl>
          </Stack>
        }
        <br />
          <ViewTimeLogTable 
            log={timeLog.timeslog} 
            editableTimeRecordIds={editableTimeRecordIds}
            nextTimeRecordId={nextTimeRecordId}
            handleTimeRecordEvent={handleTimeRecordEvent}
            handleSetTimeRecordEditMode={handleSetTimeRecordEditMode}
            cfgCategories={cfgCategories}
          />
        <br />
        { editMode != 'view'
          ? (<div className="highlight-edit">
            <EditTimeBlock
                key={timeLog.timeslog.length}
                timeLog={timeLog}
                // addTimeRecord={addTimeRecord}
                handleTimeRecordEvent={handleTimeRecordEvent}
                submitAction="AddTimeRecord"
                timeRecordId={nextTimeRecordId}
                initTimeRecord={timeLog.timeslog.length > 0 ? timeLog.timeslog[timeLog.timeslog.length - 1] : null}
                cfgCategories={cfgCategories}
             />
             </div>
          ) : (
            <div className="app-margin-left">
              <Tooltip title="Add">
                <Button onClick={() => setEditMode("single edit")}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AddCircleIcon />
                    <Typography>Add Record</Typography>
                    {/* Add Record */}
                  </Stack>
                </Button>
              </Tooltip>
            </div>
          )
        }
        <br />
        {/* <div> */}
        {/* <h1>State:</h1> */}
        {/* <span>{JSON.stringify(timeLog)}</span> */}
        {/* </div> */}
        <br />
        { isShowTodo
          ? <Button onClick={() => {setIsShowToDo(prevFlag => !prevFlag)}}>
              Hide ToDos
              <ExpandLessIcon />
            </Button>

          : <Button onClick={() => {setIsShowToDo(prevFlag => !prevFlag)}}>
              Show ToDos
              <ExpandMoreIcon />
            </Button>
        }
        { isShowTodo && <span>
          {/* TODO: TAKE THIS OUT */}
          <h1>ToDo:</h1>
            <Stack direction="row">
              <ul>
                <li><del>Add entry widgets</del></li>
                <li><del>Add submit button</del></li>
                <li><del>Add input validation</del></li>
                <li><del>Add checkboxes for categories</del></li>
                <li><del>Add checkboxes for topics</del></li>
                <li><del>Add app state and add record mechanism</del></li>
                <li><del>Render list of logged records</del></li>
                <li><del>Add current date when creating a new record</del></li>
                <li><del>Use HTML Table to render time log view</del></li>
                <li><del>Use chips for rendering categories</del></li>
                <li><del>Save on every update</del></li>
                <li><del>Set output dir from arguments</del></li>
                <li><del>Use "today" file on start. Enable re-load file from disk.</del></li>
                <li><del>Automatically order based on start time</del></li>
                <li><del>Fix isDev (dev) header label</del></li>
                <li><del>Store config in <code>~/.config/timelog</code> dir</del></li>
                <li><del>Enable configurable categories</del></li>
                <li><del>Set duration from start & end</del></li>
                <li><del>Add current time when creating a new record</del></li>
              </ul>
              <ul>
                <li>Update categories config: add colors and render grouping</li>
                <li>Render TextField when click on a cell in the table log view</li>
                <li>Add edit button to each time log record</li>
                <li>Add "break" button</li>
                <li>Maintain list of "active" records (no end time)</li>
                <li>Add Date picker to record edit view</li>
                <li>Add blank name validation</li>
                <li>Use Cards for each row?</li>
              </ul>
            </Stack>
              {/* TEMPLATES (uncomment and duplicate): */}
              {/* <li></li> */}
              {/* <li><del></del></li> */}
        </span>
      }
      </ThemeProvider>
      </main>
    </div>
  );
}

export default App;
