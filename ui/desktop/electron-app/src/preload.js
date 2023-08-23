/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { ipcRenderer, contextBridge } = require('electron');
const { Terminal } = require('xterm');
const { FitAddon } = require('xterm-addon-fit');

// Messages must originate from this origin
const emberAppOrigin = window.location.origin;

/**
 * Exposing terminal creation to an isolated context (Ember)
 * More information about contextBridge https://www.electronjs.org/docs/latest/api/context-bridge
 * usage example: window.terminal.open('terminal-container');
 */
contextBridge.exposeInMainWorld('terminal', {
  open: function (container) {
    const term = new Terminal();
    const fitAddon = new FitAddon();
    const termContainer = document.getElementById(container);

    // load Addon
    term.loadAddon(fitAddon);

    // Open the terminal in container
    term.open(termContainer);

    // Move this out of here? this should be implemented as ipc handler
    // This writes on xterm whatever comes from the host terminal.
    ipcRenderer.on('terminal.incomingData', (event, data) => {
      term.write(data);
    });
    // Move this out of here? this should be implemented as ipc handler
    // This sends to host terminal whatever is wrote on xterm.
    term.onData((e) => {
      ipcRenderer.send('terminal.keystroke', e);
    });

    // Applies fit addon
    fitAddon.fit();
  },
  openSsh: function (address, port) {
    ipcRenderer.send('terminal.keystroke', `ssh ${address} -p ${port}\r`);
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
