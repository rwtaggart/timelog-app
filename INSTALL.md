## Create a new project
```sh
> npx create-react-app react-mui-examples
> cd react-mui-examples
> npm install @mui/material @emotion/react @emotion/styled
> npm install @mui/icons-material
> npm install @mui/lab   # [OPTIONAL]
> npm start
```

https://reactjs.org/docs/create-a-new-react-app.html#create-react-app
https://mui.com/

## Modify templates
1. Change `public/index.html`
    - Modify `<title>`
    - Download a new favicon SVG into `./public`:
        https://mui.com/components/material-icons/?query=arch
        https://fonts.google.com/icons?icon.query=arch
    - Update `public/index.html` with new favicon.svg link
        e.g., `<link rel="icon" href="%PUBLIC_URL%/add_circle_white_24dp.svg" />`

1. Modify `src/App.js` and `src/App.css`
1. Add `toolbar` and modify theme


## Configure Electron
https://www.section.io/engineering-education/desktop-application-with-react/
https://medium.com/folkdevelopers/the-ultimate-guide-to-electron-with-react-8df8d73f4c97

https://www.electronjs.org/docs/latest/tutorial/
https://electronjs.org/docs/latest/tutorial/quick-start


# Project setup
React dirs: ./src and ./public
Electron dirs: ./app

# React Notes & References
https://reactjs.org/docs/hooks-state.html
https://reactjs.org/docs/events.html#keyboard-events
https://reactjs.org/docs/conditional-rendering.html

- Prefer controlled components:
    https://reactjs.org/docs/uncontrolled-components.html#:~:text=In%20a%20controlled%20component%2C%20form,form%20values%20from%20the%20DOM.

- useEffect hook:
    https://reactjs.org/docs/hooks-effect.html

- https://create-react-app.dev/docs/deployment#building-for-relative-paths
  "homepage": ".",



# Material Notes & References
https://mui.com/material-ui/react-text-field/
https://mui.com/material-ui/material-icons/


## Run
> export ELECTRON_IS_DEV=1

## TODO:

1. Update React UI and modify templates above (App.js, App.css, etc. )
2. Update electon app to add some renderer.js and preload.js bindings
3. Copy dt_utils.js from common-time project
4. Create UIs for record and log table
5. Save session data to disk as CSV.
6. Bind "enter" key to save the record


## Examples
function parseBool(s) {
  if (s == null) { return s; }
  if (typeof(s) === 'string' ) { s = s.trim().toLowerCase() }
  switch(s) { 
    case true: case 1: case "true":  case "yes": case "1": case "t": return true;
    default: return false;
  }
}
