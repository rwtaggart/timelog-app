import React, { useState, useEffect } from 'react';
import './App.css';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
// import Tooltip from '@mui/material/Tooltip';
// import IconButton from '@mui/material/IconButton';
// import CopyIcon from '@mui/icons-material/ContentCopy';
import GitHubIcon from '@mui/icons-material/GitHub';
import setDT from 'date-fns/set'
import format from 'date-fns/format'
import { parseTime, parseDate, dateFmt, timeFmt, writeData, loadData, isDev as isDevFnc } from './utils.js'

// import { categories, topics } from './constants.js'
import { ViewTimeLogTable, EditTimeBlock, resetTimeRecord, NullTime, TimeZeros } from './TimeBlock.js'


function App() {
  const [ isDev, setIsDev ] = useState(() => isDevFnc())
  const [ session_id, setSessionId ] = useState("")
  const [ editMode, setEditMode ] = useState("view")
  const [ timesLog, settimesLog ] = useState([])  // QUESTION: useReducer() instead?
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const addTimeRecord = (timeRecord) => {
    settimesLog(prevTimesLog => {
      const updateTimesLog = [...prevTimesLog, timeRecord]
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
              {isDev && <span>(dev)</span>}
            </div>
            <FormControl>
              <FormLabel>Edit Mode</FormLabel>
              <RadioGroup row
                value={editMode}
                onChange={(e) => setEditMode(e.target.value)}
              >
                <FormControlLabel value="view"        control={<Radio />} label="view"        />
                <FormControlLabel value="single edit" control={<Radio />} label="single edit" />
                <FormControlLabel value="bulk edit"   control={<Radio />} label="bulk edit"   />
              </RadioGroup>
            </FormControl>
            {/* <Button onClick={handleWriteData}>STORE DATA</Button> */}
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
            <Button onClick={handleReloadData}>RELOAD</Button>
          </Stack>
          {/* <GitHubIcon onClick={e =>  window.location.href=''} /> */}
          {/* <span fixme="hack: why do we need this ??"/> */}
        </ThemeProvider>
      </header>
      <main className="app-content">
        {/* <FormControlLabel control={
            <Switch checked={isEditMode} onChange={(e) => {setisEditMode(!isEditMode)}} />
          }
          label="edit mode" 
        /> */}
        <br />
        <ViewTimeLogTable log={timesLog} />
        <br />
        {editMode != 'view' && <EditTimeBlock addTimeRecord={addTimeRecord} initTimeRecord={resetTimeRecord()} />}
        <br />
        <br />
        {/* <h1>DEBUG</h1>
        <br />
        <span>{JSON.stringify(timesLog)}</span>
        <br />
        <br /> */}
        <span>
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
              </ul>
              <ul>
                <li>Fix isDev (dev) header label</li>
                <li>Enable configurable categories</li>
                <li>Store config in <code>~/.config/timelog</code> dir</li>
                <li>Set duration from start & end</li>
                <li>Maintain list of "active" records (no end time)</li>
                <li>Add Date picker to record edit view</li>
                <li>Add current time when creating a new record</li>
                <li>Add duration format and blank name validation</li>
                <li>Add "break" button</li>
                <li>Add edit button to each time log record</li>
                <li>Render TextField when click on a cell in the table log view</li>
                <li>Automatically order based on start time</li>
                <li>Use Cards for each row?</li>
              </ul>
              <li><del></del></li>
              <li></li>
            </Stack>
              {/* TEMPLATES (uncomment and duplicate): */}
              {/* <li></li> */}
              {/* <li><del></del></li> */}
        </span>
      </main>
    </div>
  );
}

export default App;
