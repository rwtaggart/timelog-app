/**
 *  Component for rendering the various edit blocks
 *  R Taggart
 *  27 Oct. 2022
 */

import React, {useState} from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import setDT from 'date-fns/set'
import { parseTime, parseDate, dateFmt, timeFmt } from './utils.js'
import { categories } from './constants.js'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

const Row = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));

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

export const resetTimeRecord = (initStart, isInitEnd, tl) => {
  const now = timeFmt(new Date())
  let timeRecord = {...NullTime}
  timeRecord.date = dateFmt(setDT(new Date(), TimeZeros))
  timeRecord.start = initStart != null ? initStart : now
  if (isInitEnd && now !== timeRecord.start) {
    timeRecord.end = now
  }
  return timeRecord
}

/** Categories & Topics */
export function Categories(props) {
  const { selected, setSelected } = props
  const initCategories = () => {
    return categories.reduce((prev, cur) => { let mod = {...prev }; mod[cur]=(selected.includes(cur)) ? true : false; return mod;}, {})
  }
  const [isChecked, setIsChecked] = useState(initCategories)
  const handleChange = (name) => (e) => {
    let modIsChecked = {...isChecked}
    modIsChecked[name] = !isChecked[name]
    setIsChecked(modIsChecked)
    if (modIsChecked[name]) {
      setSelected([...selected, name])
    } else {
      let idx = selected.indexOf(name)
      if (idx != -1) {
        let modSelected = [...selected]
        modSelected.splice(idx, 1)
        setSelected(modSelected)
      }
    }
  }
  return (
    // Stack Method
    // <Stack direction="row">
    //   {categories.map(name =>
    //     // <Checkbox key={'cat'+name+'cb'} checked={isChecked[name]} onChange={handleChange(name)} />
    //     <FormControlLabel
    //       key={'cat'+name+'fc'}
    //       label={name} 
    //       control={ <Checkbox key={'cat'+name+'cb'} checked={isChecked[name]} onChange={handleChange(name)} /> } 
    //     />
    //     )}
    // </Stack>
    
    //Grid Method
    <Grid container spacing={1}>
      {categories.map(name =>
        // <Checkbox key={'cat'+name+'cb'} checked={isChecked[name]} onChange={handleChange(name)} />
        <Grid item>
          <FormControlLabel
            key={'cat'+name+'fc'}
            label={name} 
            control={ <Checkbox key={'cat'+name+'cb'} checked={isChecked[name]} onChange={handleChange(name)} /> } 
          />
        </Grid>
        )}
    </Grid>
  )
}

export function Topics(props) {

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

  const handleCategoryChange = (selected) => {
    setTime({...time, 'categories': selected})
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
    <Box>
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
      <Categories selected={time.categories} setSelected={handleCategoryChange}/>
      {isShowErrMsg && <span className="error">Time format is invalid</span>}
    </Box>
    </>
  )
}

/*
 *  View Time Log
 */
export function ViewTimeLogSpan(props) {
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
          <span>{JSON.stringify(record.categories)}</span>
        </Stack>
      )}
    </Stack>
  )
}

export function ViewTimeLogGrid(props) {
  const { log } = props
  return (
    <Grid container spacing={1}>
      {log.map((record) => 
        // <Item>
        <Grid container item spacing={5} key={ record.start + record.end }>
          <>
            <Grid item>
              <span>{record.date}</span>
            </Grid>
            <Grid item>
            </Grid>
              <span>{record.start}</span>
            <Grid item>
              <span>{record.end}</span>
            </Grid>
            <Grid item>
              <span>{record.duration}</span>
            </Grid>
            <Grid item>
              <span>{record.name}</span>
            </Grid>
            <Grid item>
              <span>{record.categories.join(',')}</span>
            </Grid>
          </>
        </Grid>
        // </Item>
        // <Stack direction="row" spacing={10} key={ record.start + record.end }>
        //   <span>{record.date}      </span>
        //   <span>{record.start}     </span>
        //   <span>{record.end}       </span>
        //   <span>{record.duration}  </span>
        //   <span>{record.name}      </span>
        //   <span>{JSON.stringify(record.categories)}</span>
        // </Stack>
      )}
    {/* </Stack> */}
    </ Grid>
  )
}


export function ViewTimeLogTable(props) {
  const { log } = props
  return (
    <table>
      {/* thead and tbody break the rendering for some reason... */}
      {/* <thead> */}
      <tr className='theader'>
        <th>Date</th>
        <th>Start</th>
        <th>End</th>
        {/* <th>Duration</th> */}
        <th>Name</th>
        <th>Categories</th>
      </tr>
      {/* </thead> */}
        {/* <tbody> */}
        {log.map((record) => 
          // <Paper>
            <tr key={ record.start + record.end }>
              <>
                <td>{record.date}</td>
                <td>{record.start}</td>
                <td>{record.end}</td>
                {/* <td>{record.duration}</td> */}
                <td>{record.name}</td>
                {/* <td>{record.categories.join(',')}</td> */}
                <td>{record.categories.map(cat => <Chip label={cat} variant="outlined" />)}</td>
              </>
            </tr>
          // </Paper>
        )}
        {/* </tbody> */}
    </table>
  )
}
