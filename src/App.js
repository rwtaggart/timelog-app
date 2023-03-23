import React, { useState, useEffect } from 'react';
import './App.css';

import isBefore from 'date-fns/isBefore';

import { createTheme, ThemeProvider } from '@mui/material/styles';
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
import EditIcon from '@mui/icons-material/Edit';
import RepeatOnIcon from '@mui/icons-material/RepeatOn';
import TableChartIcon from '@mui/icons-material/TableChart';

import GitHubIcon from '@mui/icons-material/GitHub';
import { parseDateTime, parseTime, parseDate, dateFmt, timeFmt, writeData, loadData, loadCfgCategories, editCfgCategories, initCategories, isDev as isDevFnc} from './utils.js';
// isDev as isDevFnc

import { categories } from './constants.js';
import { ViewTimeLogTable, EditTimeBlock, resetTimeRecord, NullTime, TimeZeros } from './TimeBlock.js';
import { DayRatingGroup, customRatingIcons } from './DayRating.js';


function App() {
  /** TODO: Move all "show" boolean settings into a single object **/
  const [ isDev, setIsDev ] = useState(false)
  const STATE_VERSION = "0.2.0"
  const [ isShowSettings, setIsShowSettings ] = useState(false)
  const [ isShowTodo, setIsShowToDo ] = useState(false)
  const [ session_id, setSessionId ] = useState("")
  const [ editMode, setEditMode ] = useState("view")
  const [ showEditModeSw, setShowEditModeSw ] = useState(false)
  // const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  const [ timesLog, settimesLog ] = useState([])  // QUESTION: useReducer() instead?
  const [ dayRating, setDayRating ] = useState(0)
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

  const addTimeRecord = (timeRecord) => {
    settimesLog(prevTimesLog => {
      const updateTimesLog = [...prevTimesLog, timeRecord]
      updateTimesLog.sort((a, b) => (
        isBefore(
          parseDateTime(a.date, a.start), 
          parseDateTime(b.date, b.start)
        ) ? -1 : 1
      ))
      // TODO: Store entire "state" persistently with useReducer() above...
      const state = {
        v: STATE_VERSION,
        rating: dayRating,
        timeslog: updateTimesLog
      }
      writeData(session_id, state)
      return updateTimesLog
    })
    if (editMode != 'bulk edit') {
      setEditMode("view")
    }
  }

  // TODO: Add Save button and key binding
  const handleWriteData = async (e) => {
    console.log('(D): handleWriteData: ', JSON.stringify(timesLog))
    let rc = await writeData(session_id, timesLog)
    console.log('writeData rc=', rc)
  }

  const handleReloadData = async (e) => {
    const data = await loadData(session_id)
    console.log('(D): handleReloadData: ', `${data.length}`, `${data}`)
    // FIXME: handle multiple versions of data...
    // TODO: Handle this in the utils.js "api" part...
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        // OLD - deprecated. TODO: TAKE OUT.
        settimesLog(data)
      } else if (data && data.v === "0.2.0") {
        // TODO: Support multiple versions ?
        setDayRating(data.rating)
        settimesLog(data.timeslog)
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
              <Stack direction="row">
                <FormLabel onClick={() => setShowEditModeSw(prevFlag => !prevFlag)}>View Mode:</FormLabel>
                {showEditModeSw || 
                  <>
                    {editMode == "view"        && <Stack direction="row" spacing={1}><TableChartIcon /></Stack>}
                    {editMode == "single edit" && <Stack direction="row" spacing={1}><EditIcon /></Stack>}
                    {editMode == "bulk edit"   && <Stack direction="row" spacing={1}><RepeatOnIcon /></Stack>}
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
          <DayRatingGroup rating={dayRating} setRating={setDayRating} />
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
          <ViewTimeLogTable log={timesLog} />
        <br />
        { editMode != 'view' 
          && <EditTimeBlock 
                key={timesLog.length}
                addTimeRecord={addTimeRecord} 
                initTimeRecord={
                  // TODO: Stuff this logic into TimeBlock.js
                  resetTimeRecord(
                    timesLog.length > 0
                      ? timesLog[timesLog.length -1].end
                      : null,
                    timesLog.length > 0,
                  )
                }
                cfgCategories={cfgCategories}
             />}
        <br />
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
