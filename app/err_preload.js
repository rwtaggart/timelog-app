/**
 * Error Message Window Preload
 * 
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

const { contextBridge, ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.on('send-err', (_event, [errName, errMsg]) => {
    console.log('(D): err: ', errName, errMsg)
    const errTitleElement = document.getElementById('err-title')
    if (errTitleElement) { errTitleElement.innerText = errName }
    const errMsgElement = document.getElementById('err-message')
    if (errMsgElement) { errMsgElement.innerText = errMsg }
    console.log('(D): elements: ', errName, errMsg)
  })
})

