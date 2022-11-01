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
import { parseTime, parseDate, dateFmt, timeFmt, writeData } from './utils.js'

// import { categories, topics } from './constants.js'
import { ViewTimeLog, EditTimeBlock, resetTimeRecord, NullTime, TimeZeros } from './TimeBlock.js'


function App() {
  const [ session_id, setSessionId ] = useState(new Date().getTime())
  const [ editMode, setEditMode ] = useState("view")
  const [ timesLog, settimesLog ] = useState([])
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const addTimeRecord = (timeRecord) => {
    settimesLog([...timesLog, timeRecord])
    if (editMode != 'bulk edit') {
      setEditMode("view")
    }
  }

  const handleWriteData = async (e) => {
    console.log('(D): handleWriteData: ', JSON.stringify(timesLog))
    let rc = await writeData(session_id, timesLog)
    console.log('writeData rc=', rc)
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
            <span className="app-title">Time Log</span>
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
        <ViewTimeLog log={timesLog} />
        <br />
        {editMode != 'view' && <EditTimeBlock addTimeRecord={addTimeRecord} initTimeRecord={resetTimeRecord()} />}
        <br />
        <br />
        {/* <h1>DEBUG</h1>
        <br />
        <span>{JSON.stringify(timesLog)}</span>
        <br />
        <br /> */}
        <Button onClick={handleWriteData}>STORE DATA</Button>
        <span>
          {/* TODO: TAKE THIS OUT */}
          <h1>ToDo:</h1>
            <ul>
              <li><del>Add entry widgets</del></li>
              <li><del>Add submit button</del></li>
              <li><del>Add input validation</del></li>
              <li>Add checkboxes for categories and topics</li>
              <li><del>Add app state and add record mechanism</del></li>
              <li><del>Render list of logged records</del></li>
              <li>Maintain list of "active" records (no end time)</li>
              <li>Add Date picker to record edit view</li>
              <li><del>Add current date when creating a new record</del></li>
              <li>Add current time when creating a new record</li>
              <li>Add duration format and blank name validation</li>
            </ul>
        </span>
      </main>
    </div>
  );
}

export default App;
