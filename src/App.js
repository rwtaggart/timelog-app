import React, { useState, useEffect } from 'react';
import './App.css';

import isBefore from 'date-fns/isBefore'

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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
import { parseDateTime, parseTime, parseDate, dateFmt, timeFmt, writeData, loadData, loadCfgCategories, } from './utils.js'
// isDev as isDevFnc

import { categories } from './constants.js'
import { ViewTimeLogTable, EditTimeBlock, resetTimeRecord, NullTime, TimeZeros } from './TimeBlock.js'


function App() {
  /** TODO: Move all "show" boolean settings into a single object **/
  // const [ isDev, setIsDev ] = useState(() => isDevFnc())
  const [ isShowSettings, setIsShowSettings ] = useState(false)
  const [ isShowTodo, setIsShowToDo ] = useState(false)
  const [ session_id, setSessionId ] = useState("")
  const [ editMode, setEditMode ] = useState("view")
  const [ showEditModeSw, setShowEditModeSw ] = useState(false)
  const [ cfgCategories, setCfgCategories ] = useState(categories)  // TODO: Stuff into a "config" object and useReducer() instead.
  const [ timesLog, settimesLog ] = useState([])  // QUESTION: useReducer() instead?
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const addTimeRecord = (timeRecord) => {
    settimesLog(prevTimesLog => {
      const updateTimesLog = [...prevTimesLog, timeRecord]
      updateTimesLog.sort((a, b) => (
        isBefore(
          parseDateTime(a.date, a.start), 
          parseDateTime(b.date, b.start)
        ) ? -1 : 1
      ))
      writeData(session_id, updateTimesLog)
      return updateTimesLog
    })
    if (editMode != 'bulk edit') {
      setEditMode("view")
    }
  }

  const handleWriteData = async (e) => {
    console.log('(D): handleWriteData: ', JSON.stringify(timesLog))
    let rc = await writeData(session_id, timesLog)
    console.log('writeData rc=', rc)
  }

  const handleReloadData = async (e) => {
    const data = await loadData(session_id)
    console.log('(D): handleReloadData: ', `${data.length}`, `${data}`)
    settimesLog(data)
  }

  const handleReloadCfgCategories = async (e) => {
    const data = await loadCfgCategories()
    console.log('(D): handleReloadCfgCategories: ', `${data.length}`, `${data}`)
    setCfgCategories(data)
  }

  const handleKeyPress = (e) => {
    console.log('(D): Key=', e.key)
    if (e.key === 'Escape') {
      setEditMode("view")
    }
    if (editMode != 'view') { return }
    if (e.key === 'e') {
      setEditMode("single edit")
    }
    if (e.key === 'b') {
      setEditMode("bulk edit")
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
          <Stack direction="row" spacing={{ xs: 4, sm: 10, md: 20 }}>
            <div>
              <span className="app-title">Time Log </span>
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
              <IconButton onClick={handleReloadData}>
                <ReplayIcon />
              </IconButton>
              <IconButton onClick={() => setIsShowSettings(prevFlag => !prevFlag)}>
                {/* FIX ME: Color switch not working... ? */}
                {/* <SettingsIcon color={ isShowSettings ? "action" : "secondary" } /> */}
                <SettingsIcon color="" />
              </IconButton>
            </Box>
          </Stack>
          {/* <GitHubIcon onClick={e =>  window.location.href=''} /> */}
          {/* <span fixme="hack: why do we need this ??"/> */}
        </ThemeProvider>
      </header>
      <main className="app-content">
        {/* TODO: Create separate Settings component */}
        {isShowSettings && 
          <Stack direction="row" spacing={2}>
            <Button onClick={handleReloadCfgCategories}>
              <ReplayIcon />
              Reload Categories
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
      </main>
    </div>
  );
}

export default App;
