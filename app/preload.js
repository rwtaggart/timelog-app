/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 * See also: 2-way communication
 *   https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way
 * 
 * TODO: Rename all methods with "." rather than ":"
 */

// TODO: TAKE OUT THIS EXAMPLE
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
  desktop: true,
})

contextBridge.exposeInMainWorld('mainAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title),
  write: (data) => ipcRenderer.send('write', data),
})

contextBridge.exposeInMainWorld('appMeta', {
  isDev: () => ipcRenderer.invoke('appMeta.isDev')
})

contextBridge.exposeInMainWorld('dataStore', {
  write: (session_id, data) => ipcRenderer.invoke('datastore.write', session_id, data),
  load:  (session_id) => ipcRenderer.invoke('datastore.load', session_id)
})
contextBridge.exposeInMainWorld('config', {
  categories: {
    load:  () => ipcRenderer.invoke('config.categories.load'),
    edit:  () => ipcRenderer.invoke('config.categories.edit'),
    // init:  (cb) => ipcRenderer.on('init:config:categories:load', cb),
    // init:  (cb) => ipcRenderer.on('init:config:categories:load', cb),
  },
  absFileName: () => ipcRenderer.invoke('config.absFileName')
})
