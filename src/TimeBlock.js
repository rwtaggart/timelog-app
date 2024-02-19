/**
 *  Component for rendering the various edit blocks
 *  R Taggart
 *  27 Oct. 2022
 */

import React, {useState, useRef} from 'react';
import { styled } from '@mui/material/styles';
import { orange } from '@mui/material/colors';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import setDT from 'date-fns/set'
import isBefore from 'date-fns/isBefore'
import formatDuration from 'date-fns/formatDuration'
import formatDistance from 'date-fns/formatDistance'

import { dayjs, dateFmt, timeFmt, durationFmt, fuzzyIntervalOverlap, parseDate, parseTime } from './dayjs_utils.js'
// import { categories } from './constants.js'

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

const DateZeros = { year: 0, month:0, date:0 }
const TimeZeros = { hours: 0, minutes:0, seconds:0, milliseconds:1 }
const EmptyTimeRecord = {
  id: null,
  // date: "",
  start: null,
  end: null,
  duration: null,
  name: "",
  description: "",
  categories: [],
  topic: [],
}

const createNewFromTimeRecord = (prevTimeRecord, timeRecordId, isDuplicate) => {
  // TODO: rename 'resetTimeRecord()' => 'copyTimeRecord()' or 'createNewFromTimeRecord()' ?
  // TAKE OUT:  OLD PARMS - {initDate, initStart, isInitEnd, tl}
  // FIXME: what is the "tl" arg??
  if (isDuplicate) {
    return {...EmptyTimeRecord, ...prevTimeRecord, id: timeRecordId}
  }
  const now = dayjs()
  let timeRecord = {...EmptyTimeRecord}
  timeRecord.id = timeRecordId
  // TODO: Add proper if (prevTimeRecord != null) { ... } block
  timeRecord.start = prevTimeRecord != null ? prevTimeRecord.end : now
  timeRecord.date = timeRecord.start
  console.log('(D): createNewFromTimeRecord: ', now, timeRecord.start)
  // QUESTION: Do we need to add isSame(..., 'minute') resolution?
  if ( prevTimeRecord != null 
       && !now.isSame(timeRecord.start)
       && timeRecord.start.isBefore(now)
  ) {
    timeRecord.end = now
  }
  return timeRecord
}

/** Categories & Topics */
export function Categories(props) {
  const { selected, setSelected, cfgCategories } = props
  const initCategories = () => {
    // Create object with category keys and isChecked flags -- e.g. { 'category_name': false, ... }
    return cfgCategories.reduce((prev, cur) => { let mod = {...prev }; mod[cur]=(selected.includes(cur)) ? true : false; return mod;}, {})
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
      {cfgCategories.map(name =>
        // <Checkbox key={'cat'+name+'cb'} checked={isChecked[name]} onChange={handleChange(name)} />
        <Grid item key={'cat'+name+'grid'}>
          <FormControlLabel
            key={'cat'+name+'fcl'}
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

// TODO: Make this work correctly
// function ViewEditDate({time, handleTextChange}) {
//   // TODO: Use DatePicker instead of basic input
//   return (
//     <span>
//       TEST &nbsp;
//       { dateFmt(parseDate(time.date)) }
//       <TextField
//             error={ errors.end }
//             id="standard-basic"
//             variant="standard"
//             label="end"
//             value={time.end}
//             onChange={handleTextChange("end")}
//             onKeyPress={handleKeyPress}
//             onBlur={validateTimeInput("end")}
//             helperText="mm:ss (am/pm)"
//           />
//     </span>
//   )
// }

/**
 * EditTimeBlock Component
 */
export function EditTimeBlock( { initTimeRecord, timeRecordId, timeLog, handleTimeRecordEvent, submitAction, isDuplicate, cfgCategories } ) {
  // TODO: do we need the timeLog here? => yes, to replace initTimeRecord.
  // TODO: rename 'addTimeRecord()' => 'handleTimeRecordEvent()'
  // TODO: replace initTimeRecord with actual "init" logic. See App.js comment for EditTimeBlock
  const [ timeRecord, setTimeRecord ]         = useState(() => (submitAction === 'ChangeTimeRecord' ? {...initTimeRecord} : {...createNewFromTimeRecord(initTimeRecord, timeRecordId, isDuplicate)}))
  const [ status, setStatus ]     = useState("Not Submitted")
  const [ keyCount, setKeyCount ] = useState(0)
  const [ errors, setErrors ] = useState({})                       // TODO: Combine errors and isShowErrorMsg ? -> YES.
  const [ isShowErrMsg, setisShowErrMsg ] = useState(false)        // TODO: use 'const isShowErrorMsg = Object.keys(errors).length > 0' instead.

  const validateDateInput = (label) => {
    return (e) => {
      // console.log('(D): validate date', label, JSON.stringify(timeRecord[label]))
      let d = null
      if ( typeof timeRecord[label] === 'string' ) {
        d = parseDate(timeRecord[label], true)
      } else if ( timeRecord[label] instanceof dayjs ) {
        d = timeRecord[label]
      }
      // console.log('(D): parseDate=', d)
      let modErrs = {...errors}
      if ( d == null || !d.isValid() ) {
        modErrs[label] = true 
      } else {
        delete modErrs[label]
        if (Object.keys(modErrs).length == 0) {
          setisShowErrMsg(false)
        }
      }
      setErrors(modErrs)
      return modErrs[label]
    }
  }
  const validateTimeInput = (label) => {
    return (e) => {
      // console.log('(D): validate time', JSON.stringify(timeRecord[label]))
      let d = null
      if ( typeof timeRecord[label] === 'string' ) {
        d = parseTime(timeRecord[label].replace(/\s/g, ''), true)
        // console.log('(D): validateTimeInput parseTime: ', d)
      } else if (timeRecord[label] instanceof dayjs) {
        d = timeRecord[label]
      }
      let modErrs = {...errors}
      if ( d == null || !d.isValid() ) { 
        modErrs[label] = true 
      } else { 
        delete modErrs[label]
        if (Object.keys(modErrs).length == 0) {
          setisShowErrMsg(false)
        }
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

    let start = timeRecord.start instanceof dayjs ? timeRecord.start : parseTime(timeRecord.start)
    let end = timeRecord.end instanceof dayjs ? timeRecord.end : parseTime(timeRecord.end)
    if ( !start.isSameOrBefore(end) ) {
      console.log('TIME BEFORE!')
      let modErrs = { ...errors }
      modErrs.end = 'end time must occur after start time'
      setErrors(modErrs)
      setisShowErrMsg(true)
      errCount+=1
    } 
    // else {
    //   if (Object.keys(modErrs).length == 0) {
    //     setisShowErrMsg(false)
    //   }
    // }
    console.log('(D): error count', errCount)
    // TODO: Add ValidateDurationInputs
    // for (let idx in durationLabels) {
    //   if ( !validateTimeInput(timeLabels[idx])() ) {
    //     errCount += 1;
    //   }
    // }
    // TODO: Add "Blank Name" validation
    if (errCount == 0 ) {
      setisShowErrMsg(false)
    }
    return errCount == 0
  }

  const handleTextChange = (label) => {
    return (e) => {
      let modTimeRecord = {...timeRecord}
      modTimeRecord[label] = e.target.value
      if (modTimeRecord[label] == 'n') {
        // FIXME: Should only apply to "date" fields
        modTimeRecord[label] = dayjs()
      }
      console.log('CHG: ', label, e.target.value, modTimeRecord)
      setTimeRecord(modTimeRecord)
    }
  }

  const handleCategoryChange = (selected) => {
    setTimeRecord({...timeRecord, 'categories': selected})
  }

  const handleSubmit = async (e) => {
    // TODO: Rename 'handleSubmit()' => 'handleAddTimeRecord()'
    if (validateInputs()) {
      console.log('(D): handleSubmit before setTime: ', `${timeRecord.duration}, ${timeRecord.start}, ${timeRecord.end}`)
      // await setTime(prevTime => {
      //   // FIXME: This doesn't work. Incorrectly call setState() for multiple components during the same "update" hook cycle.
      //   const startdt = parseDateTime(prevTime.date, prevTime.start)
      //   const enddt = parseDateTime(prevTime.date, prevTime.end)
      //   // const durdt = enddt - startdt
      //   const durdt = formatDistance(enddt, startdt)
      //   console.log('(D): handleSubmit update time: ', `${prevTime.duration}, ${startdt}, ${enddt}, ${durdt}`)
      //   const modTime = {...time, 'duration': durdt}
      //   console.log('(D): handleSubmit after setTime: ', `${modTime.duration}, ${modTime.start}, ${modTime.end}`)
      //   return resetTimeRecord()
      // })
      console.log('(D): handleSubmit after setTime: ', `${timeRecord.duration}, ${timeRecord.start}, ${timeRecord.end}`)
      // addTimeRecord(time)  // FIXME: REPLACE WITH: handleTimeRecordEvent()

      let modTimeRecord = {...timeRecord}
      // FIXME: Handle changes to the date... ?
      if ( typeof timeRecord.start === 'string' ) {
        modTimeRecord.start = parseTime(timeRecord.start)
      }
      if ( typeof timeRecord.end === 'string' ) {
        modTimeRecord.end = parseTime(timeRecord.end)
      }
      handleTimeRecordEvent({
        type: submitAction,
        timeRecord: modTimeRecord,
      })
      setTimeRecord(createNewFromTimeRecord())
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
  // TODO: Add support for 'handleChangeTimeRecord()'

  return (
    <>
    <Box>
      <Stack direction="row" spacing={1}>
          {/* TODO: Use DatePicker ? */}
          {/* OLD: <span> { dateFmt(parseDate(time.date)) } </span> */}
          {/* <ViewEditDate time={time}/> */}
          {
            // TODO: select all text "onFocus"
            // FIXME: onFocus doesn't work :(
            // onFocus={() => { let s = window.getSelection(); console.log('(D): sel=' + s, s.anchorNode, s.focusNode); /* s.extend(s.anchorNode);*/ })
          }
          <TextField
            autoFocus
            error={ errors.date }
            id="standard-basic"
            variant="standard"
            label="date"  
            value={dateFmt(timeRecord.date)}
            onChange={handleTextChange("date")}
            onKeyPress={handleKeyPress}
            onBlur={validateDateInput("date")}
            helperText="EEE, MMM. dd"
          />
          <TextField
            autoFocus
            error={ errors.start }
            id="standard-basic"
            variant="standard"
            label="start"  
            value={timeFmt(timeRecord.start)}
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
            value={timeFmt(timeRecord.end)}
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
            value={timeRecord.name}
            onChange={handleTextChange("name")}
            onKeyPress={handleKeyPress}
          />
          <TextField
            id="standard-basic"
            variant="standard"
            label="description"
            value={timeRecord.description}
            onChange={handleTextChange("description")}
            onKeyPress={handleKeyPress}
          />
          <Tooltip title="Add">
            <IconButton onClick={handleSubmit}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
      </Stack>
      <Categories selected={timeRecord.categories} setSelected={handleCategoryChange} cfgCategories={cfgCategories}/>
      {isShowErrMsg && <span className="error">Time format is invalid</span>}
      {isShowErrMsg && errors['end'] && <span className="error"> ({errors['end']})</span>}
    </Box>
    </>
  )
}

// /*
//  *  View Time Log
//  */
// export function ViewTimeLogSpan(props) {
//   const { log } = props
//   return (
//     <Stack spacing={1}>
//       {log.map((record) => 
//         <Stack direction="row" spacing={10} key={ record.start + record.end }>
//           <span>{record.date}      </span>
//           <span>{record.start}     </span>
//           <span>{record.end}       </span>
//           <span>{record.duration}  </span>
//           <span>{record.name}      </span>
//           <span>{JSON.stringify(record.categories)}</span>
//         </Stack>
//       )}
//     </Stack>
//   )
// }

export function ViewTimeLogGrid(props) {
  const { log } = props
  return (
    <Grid container spacing={1}>
      {log.map((record) => 
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
              <span>{[...record.categories, record.description].join(',')}</span>
            </Grid>
          </>
        </Grid>
      )}
    </ Grid>
  )
}

function LogGap({ record, idx, all, handleAddRecord }) {
  // TODO: rename 'LogGap' => 'TimeRecordGap' ?
  // let prevIdx = (idx > 0) ? idx-1 : 0
  // console.log('(D): LogGap: ', record.start, idx, prevIdx, fuzzyIntervalOverlap(record, all[prevIdx]))

  return (
    (idx > 0 && !fuzzyIntervalOverlap(record, all[idx-1])) &&
        <tr>
          <td></td>
          <td>
            <Stack direction="row" justifyContent="flex-end">
              <Tooltip title="Add">
                <IconButton sx={{ color: orange[700] }} onClick={() => handleAddRecord({id: record.id, date: record.date, start: all[idx-1].end, end: record.start})}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </td>
          <td className="missing">{timeFmt(all[idx-1].end)}</td>
          <td className="missing">{timeFmt(record.start)}</td>
          { 
            (idx > 0)
            ? <td className="right missing" >{durationFmt(all[idx-1].end, record.start)}</td>
            : <td></td> 
          }
          <td className="missing">??</td>
          <td></td>
        </tr>
  )
}

export function ViewTimeLogTable( {log, editableTimeRecordIds, nextTimeRecordId, handleSetTimeRecordEditMode, handleTimeRecordEvent, editTimeGapRecords, setEditTimeGapRecords, cfgCategories } ) {
  /** Render data by generating HTML Table tags */
  // TODO: add handleEditEvent() prop
  const [ isEnableDelete, setIsEnableDelete ] = useState(true)
  
  // <Button onClick={() => setIsEnableDelete(!isEnableDelete)}>
  //   {/* {isEnableDelete ? "Remove" : "Edit"} */}
  //   {isEnableDelete ? "Edit" : "View"}
  // </Button>

  return (
    <table>
      {/* thead and tbody break the rendering for some reason... */}
      <thead>
        <tr className='theader'>
          {/* <th>ID</th> */}
          <th key="theader-edit-button">{/* <Button> isEnableDelete ? "Edit" : "View" </Button> */}</th>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Span</th>
          <th>Name</th>
          <th>Categories</th>
        </tr>
      </thead>
      <tbody>
        {log.map((record, idx, all) => {
          const isEditable = editableTimeRecordIds.includes(record.id)
          const editTimeGapRecord = editTimeGapRecords.filter(timeGapRecord => timeGapRecord.id === record.id)[0]
          // <Paper> -- For some reason, <tr> and <Paper> tags are not friends.
          return <>
            <LogGap {...{record: record, idx:idx, all:all}} handleAddRecord={timeGapRecord => setEditTimeGapRecords([...editTimeGapRecords, timeGapRecord])} />
            {/* <span>Time Gap Record: "{JSON.stringify(editTimeGapRecord)}" - {editTimeGapRecord == null ? "null" : "Valid"}</span> */}
            { (editTimeGapRecord != null) &&
              <>
                <td colspan="8" className="highlight-edit">
                  <Stack direction="row" spacing={2}>
                    <Tooltip title="Cancel">
                      <IconButton
                        onClick={() => {
                          handleTimeRecordEvent({type: "CancelChangeTimeRecord", timeRecordId: record.id})
                          setEditTimeGapRecords(editTimeGapRecords.filter(timeGapRecord => timeGapRecord.id !== record.id))
                      }} >
                        <ClearIcon />
                      </IconButton>
                    </Tooltip>
                    <EditTimeBlock
                      key={log.length}
                      timeLog={log}
                      // addTimeRecord={addTimeRecord}
                      handleTimeRecordEvent={(action) => {
                        if (action.type === "AddTimeRecord") {
                          setEditTimeGapRecords(editTimeGapRecords.filter(timeGapRecord => timeGapRecord.id !== record.id))
                        }
                        handleTimeRecordEvent(action)
                      }}
                      submitAction="AddTimeRecord"
                      isDuplicate={true}
                      timeRecordId={nextTimeRecordId}
                      initTimeRecord={{...EmptyTimeRecord, ...editTimeGapRecord}}
                      cfgCategories={cfgCategories}
                  />
                  </Stack>
                </td>
              </>
            }

            <tr key={ record.start + record.end }>
              { isEditable
                ? (
                  <>
                    <td colspan="8" className="highlight-edit">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <div>
                          <Tooltip title="Cancel">
                            <IconButton onClick={() => {handleTimeRecordEvent({type: "CancelChangeTimeRecord", timeRecordId: record.id})}} >
                              <ClearIcon />
                            </IconButton>
                          </Tooltip>
                        </div>
                        <EditTimeBlock
                          key={log.length}
                          timeLog={log}
                          // addTimeRecord={addTimeRecord}
                          handleTimeRecordEvent={handleTimeRecordEvent}
                          submitAction="ChangeTimeRecord"
                          timeRecordId={record.id}
                          initTimeRecord={record}
                          cfgCategories={cfgCategories}
                      />
                      </Stack>
                    </td>
                  </>
                ) : (
                  <>
                    {/* <td>{record.id}</td> */}
                    <td>
                    { isEnableDelete && 
                      <Stack 
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-end"
                      >
                          {/* <Tooltip title="Delete">
                            <IconButton color='error' onClick={() => {handleTimeRecordEvent({type: "DeleteTimeRecord", timeRecordId: record.id})}} >
                              <RemoveCircleIcon />
                            </IconButton>
                          </Tooltip> */}
                        <Tooltip title="Edit">
                          <IconButton color="inherit" size="small" edge="end" onClick={() => {handleSetTimeRecordEditMode(record.id)}} >
                            <EditIcon size="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                    </td>
                    <td>{dateFmt(record.start)}</td>
                    <td>{timeFmt(record.start)}</td>
                    <td>{timeFmt(record.end)}</td>
                    <td className="right">{durationFmt(record.start, record.end)}</td>
                    <td>{record.name}</td>
                    <td>{[...record.categories, record.description].map(cat => (cat && cat != null && cat != "") && <Chip label={cat} variant="outlined" />)}</td>
                  </>
                )
              }
            </tr>
          </>
        }
        )}
      </tbody>
    </table>
  )
}
