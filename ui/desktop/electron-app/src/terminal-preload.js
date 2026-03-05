/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * This preload is for the sandboxed terminal renderer.
 * Exposes `window.terminal` API (via `contextBridge`) used by
 * `terminal-view/terminal.js` to connect xterm.js to a node-pty instance running
 * in the main process.
 */

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('terminal', {
  send: (data, id) => {
    ipcRenderer.send(`terminalKeystroke-${id}`, data);
  },
  receive: (callback, id) => {
    const incomingDataChannel = `terminalIncomingData-${id}`;
    const listenerCallback = (_event, value) => callback(value);
    ipcRenderer.on(incomingDataChannel, listenerCallback);

    // Return a function for the caller to handle cleaning up the listener
    return () => {
      return ipcRenderer.removeListener(incomingDataChannel, listenerCallback);
    };
  },
  create: (vars) => {
    ipcRenderer.send('createTerminal', vars);
  },
  remove: (id) => {
    ipcRenderer.send(`removeTerminal-${id}`);
  },
  resize: (size, id) => {
    ipcRenderer.send(`resizeTerminal-${id}`, size);
  },
  cleanup: (callback) => {
    const listener = () => callback();
    ipcRenderer.once('cleanupTerminal', listener);
    // Return a function for the caller to handle cleaning up the listener
    return () => ipcRenderer.removeListener('cleanupTerminal', listener);
  },
});
