/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { ipcRenderer, contextBridge } = require('electron');

// Messages must originate from this origin
const emberAppOrigin = window.location.origin;

/**
 * Exposing terminal creation to an isolated context (Ember)
 * More information about contextBridge https://www.electronjs.org/docs/latest/api/context-bridge
 * usage example: window.terminal.send(data);
 */
contextBridge.exposeInMainWorld('terminal', {
  // We could've sent data through our established postMessage pattern
  // but we don't need a response back so we can make it include it here
  // to make it simpler. This keeps sending and receiving handlers symmetrical.
  send: (data, id) => {
    ipcRenderer.send(`terminalKeystroke-${id}`, data);
  },
  receive: (callback, id) => {
    const incomingDataChannel = `terminalIncomingData-${id}`;
    ipcRenderer.on(incomingDataChannel, callback);

    // Return a function for the caller to handle cleaning up the listener
    return () => {
      return ipcRenderer.removeListener(incomingDataChannel, callback);
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
});

process.once('loaded', () => {
  /**
   * Ember-land has no access to the renderer or node modules, and thus
   * cannot call into the main process or make invocations directly.
   * In order to communicate with the main process, the Ember app uses
   * the `postMessage` interface to send messages to its browser window.
   * These messages include message ports with which to receive responses from
   * the main process.
   *
   * This preload script simply wires up the forwarding of
   * messages received on the window and responses received from main.
   */
  window.addEventListener('message', async function (event) {
    if (event.origin !== emberAppOrigin) return;
    const { method, payload } = event?.data ?? {};
    if (method) {
      const response = await ipcRenderer.invoke(method, payload);
      event.ports[0].postMessage(response);
    }
  });
});

contextBridge.exposeInMainWorld('electron', {
  onAppQuit: () => {
    ipcRenderer.send('onAppQuit');
  },
});
