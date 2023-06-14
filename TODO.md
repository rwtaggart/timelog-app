# TODO:
These are the remaining tasks:
<ul>
  <li>Update categories config: add colors and render grouping</li>
  <li>Add "break" button</li>
  <li>Add Date picker to record edit view</li>
  <li>Add blank name validation</li>
  <li>Use Cards for each row?</li>
  <li>Load time logs from previous files to modify and save</li>
  <li>Add button to duplicate an existing record, but use the time from most recent record.</li>
  <li>Add summary charts for daily, weekly, monthly, quarterly averages (see old spreadsheet).</li>
</ul>


# COMPLETE:
These are the things that we've done!
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
  <li><del>Render "time gap" between records</del></li>
  <li><del>Add edit button to each time log record</del></li>
  <li><del>Render TextField when click on a cell in the table log view</del></li>
  <li><del>Maintain list of "active" records (no end time)</del></li>
  <li><del>Add new record for time gaps</del></li>
</ul>


# TAKE OUT:
```javascript
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
```
