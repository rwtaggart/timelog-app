/**
 *  Component for rendering the various edit blocks
 *  R Taggart
 *  27 Oct. 2022
 */

import React, {useState} from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import setDT from 'date-fns/set'
import { parseTime, parseDate, dateFmt, timeFmt } from './utils.js'

const timeLabels = [ 'start', 'end', ]
const durationLabels = [ 'duration' ]

export const DateZeros = { year: 0, month:0, date:0 }
export const TimeZeros = { hours: 0, minutes:0, seconds:0, milliseconds:1 }
export const NullTime = {
  date: "",
  start: "",
  end: "",
  duration: "",
  name: "",
  description: "",
  categories: [],
  topic: [],
}

export const resetTimeRecord = () => {
  let timeRecord = {...NullTime}
  timeRecord.date = dateFmt(setDT(new Date(), TimeZeros))
  timeRecord.start = timeFmt(new Date())
  return timeRecord
}

/**
 * EditTimeBlock Component
 */
export function EditTimeBlock(props) {
  const { initTimeRecord, addTimeRecord } = props
  const [ time, setTime ]         = useState({...initTimeRecord})  // RENAME => timeRecord
  const [ status, setStatus ]     = useState("Not Submitted")
  const [ keyCount, setKeyCount ] = useState(0)
  const [ errors, setErrors ] = useState({})
  const [ isShowErrMsg, setisShowErrMsg ] = useState(false)

  console.log("(D): time: ", JSON.stringify(time))
  
  const validateTimeInput = (label) => {
    // TODO: rename => valiidateTimeInput()
    return (e) => {
      console.log('(D): validate value', JSON.stringify(time[label]))
      const d = parseTime(time[label].replace(/\s/g, ''))
      let modErrs = {...errors}
      if (isNaN(d)) { 
        modErrs[label] = true 
      } else { 
        delete modErrs[label]
        if (Object.keys(modErrs).length == 0) {
          setisShowErrMsg(false)
        }
        // TODO: Compute elapsed time / duration ?
      }
      setErrors(modErrs)
      return modErrs[label]
    }
  }
  const validateInputs = () => {
    let errCount = 0
    for (let idx in timeLabels) {
      if ( validateTimeInput(timeLabels[idx])() != null) {
        errCount += 1;
      }
    }
    console.log('(D): error count', errCount)
    // TODO: Add ValidateDurationInputs
    // for (let idx in durationLabels) {
    //   if ( !validateTimeInput(timeLabels[idx])() ) {
    //     errCount += 1;
    //   }
    // }
    // TODO: Add "Blank Name" validation
    return errCount == 0
  }

  const handleTextChange = (label) => {
    return (e) => {
      let modTime = {...time}
      modTime[label] = e.target.value
      console.log('CHG: ', label, e.target.value, modTime)
      setTime(modTime)
    }
  }
  const handleSubmit = (e) => {
    if (validateInputs()) {
      addTimeRecord(time)
      setTime(resetTimeRecord())
    } else {
      console.log("(D): showErrMsg")
      setisShowErrMsg(true)
    }
  }
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <>
    <Stack direction="row" spacing={1}>
        <span>
          { dateFmt(parseDate(time.date)) }
        </span>
        <TextField
          error={ errors.start }
          id="standard-basic"
          variant="standard"
          label="start"  
          value={time.start}
          onChange={handleTextChange("start")}
          onKeyPress={handleKeyPress}
          onBlur={validateTimeInput("start")}
          helperText="mm:ss (am/pm)"
        />
        <TextField
          error={ errors.end }
          id="standard-basic"
          variant="standard"
          label="end"
          value={time.end}
          onChange={handleTextChange("end")}
          onKeyPress={handleKeyPress}
          onBlur={validateTimeInput("end")}
          helperText="mm:ss (am/pm)"
        />
        {/* <TextField
          id="standard-basic"
          variant="standard"
          label="duration"
          value={time.duration}
          onChange={handleTextChange("duration")}
          onKeyPress={handleKeyPress}
          helperText="e.g., 4h 30m 10s"
        /> */}
        <TextField
          id="standard-basic"
          variant="standard"
          label="name"
          value={time.name}
          onChange={handleTextChange("name")}
          onKeyPress={handleKeyPress}
        />
        <TextField
          id="standard-basic"
          variant="standard"
          label="description"
          value={time.description}
          onChange={handleTextChange("description")}
          onKeyPress={handleKeyPress}
        />
        <Tooltip title="Add">
          <IconButton onClick={handleSubmit}>
            <AddCircleIcon />
          </IconButton>
        </Tooltip>
    </Stack>
    {isShowErrMsg && <span className="error">Time format is invalid</span>}
    </>
  )
}

/*
 *  View Time Log
 */
export function ViewTimeLog(props) {
  const { log } = props

  return (
    <Stack spacing={1}>
      {log.map((record) => 
        <Stack direction="row" spacing={10} key={ record.start + record.end }>
          <span>{record.date}      </span>
          <span>{record.start}     </span>
          <span>{record.end}       </span>
          <span>{record.duration}  </span>
          <span>{record.name}      </span>
        </Stack>
      )}
    </Stack>
  )
}