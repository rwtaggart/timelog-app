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


# Electron
## Electron References
https://www.section.io/engineering-education/desktop-application-with-react/
https://medium.com/folkdevelopers/the-ultimate-guide-to-electron-with-react-8df8d73f4c97

https://www.electronjs.org/docs/latest/tutorial/
https://electronjs.org/docs/latest/tutorial/quick-start
https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging

## Initialize electron
1. Install Electron
  ```sh
  npm install --save-dev electron
  ```

2. Create the following dir & files:
  - ./app/
    - preload.js
    - main.js
3. Update `package.json`
  ```
  "main": "./app/main.js",
  ...
  "scripts": [
    ...
    "dev": "DEV=1 concurrently -k \"BROWSER=none npm run start-dev\" \"npm run electron\"",
    "devb": "BROWSER=none npm run start-dev",
    "deve": "DEV=1 electron .",
    "electron": "wait-on tcp:3000 && electron .",
  ],
  ```

## Configure Electron Publish
https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging

```
npm install --save-dev @electron-forge/cli
npx electron-forge import
```
Add icon to `forge.config.js`
```
  packagerConfig: {
    icon: './app/baseline_work_history_blue_36dp'
  },
```

Create a binary executable for electron
```sh
> unset ELECTRON_IS_DEV
> npm run build # build production react app
> npm run make  # create distributable in ./out
> open "./out/Time Log-darwin-arm64/Time Log.app"
> cp -r "./out/Time Log-darwin-arm64/Time Log.app" "$HOME/Applications/Time Log.app" 

# > rm -r ~/lib/time-log-ui.app
# > cp -r "./out/Time Log-darwin-arm64/Time Log.app" "~/Applications/Time Log.app"
# > cp -r ./out/time-log-ui-darwin-arm64/time-log-ui.app  ~/lib/time-log-ui.app
# > cp -r ./out/time-log-ui-darwin-arm64/time-log-ui.app  "~/Applications/Time Log.app"
# > open ./out/time-log-ui-darwin-arm64/time-log-ui.app  # test app
```

### Create a DMG MacOS image
https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging
https://www.electronforge.io/config/makers/dmg
https://js.electronforge.io/interfaces/_electron_forge_maker_dmg.MakerDMGConfig.html
https://www.electron.build/configuration/dmg


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
    If you are trying to synchronize with an external system, then you may need an effect.
    https://reactjs.org/docs/hooks-effect.html
    https://react.dev/reference/react/useEffect#useeffect

- https://create-react-app.dev/docs/deployment#building-for-relative-paths
  "homepage": ".",

- useReducer:
  https://react.dev/learn/extracting-state-logic-into-a-reducer

- React State & Updating Objects:
  https://react.dev/learn/updating-objects-in-state
  https://react.dev/learn/choosing-the-state-structure



# Material Notes & References
https://mui.com/material-ui/react-text-field/
https://mui.com/material-ui/material-icons/


## Run
```
> ./run.sh  # Starts dev env and copies command onto clipboard

# Executes the following:
> export ELECTRON_IS_DEV=1
> npm run devb &
> npm run deve
```

Note: for some reason this doesn't work anymore, after adding electron forge packaging.
> npm run dev

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

## Icons
Use ICNS file for MacOS.
https://fonts.google.com/icons

https://discussions.apple.com/thread/8064576?answerId=32235060022#32235060022

1. Download from Material Icons
2. Save as SVG
  1. Modify SVG and make image at least 512x512
  2. Add <rect> to make background
  3. Translate and expand viewport to add white-space padding
3. Copy into Keynote and apply instant alpha
4. Open in Preview
  1. Tools -> Adjust size
  2. Set size: 512 x 512
  3. Change resolution to at least 300 dpi (px / in)
5. File -> Alt-click "Save As"
6. Alt-click file types -> .icns 
   (must be at least 512x512 to store as ICNS format)
