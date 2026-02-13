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
    ipcRenderer.send(`resize-${id}`, size);
  },
  cleanup: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('cleanupTerminal', listener);
    return () => ipcRenderer.removeListener('cleanupTerminal', listener);
  },
});
