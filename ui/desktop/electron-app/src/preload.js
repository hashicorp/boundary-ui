/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const { ipcRenderer, contextBridge } = require('electron');
const { Terminal } = require('xterm');
const { FitAddon } = require('xterm-addon-fit');

// Messages must originate from this origin
const emberAppOrigin = window.location.origin;

contextBridge.exposeInMainWorld('terminal', {
  open: function (container) {
    const term = new Terminal();
    const fitAddon = new FitAddon();

    // load Addon
    term.loadAddon(fitAddon);

    // Open the terminal in container
    term.open(document.getElementById(container));

    // Move this out of here?
    ipcRenderer.on('terminal.incomingData', (event, data) => {
      term.write(data);
    });

    term.onData((e) => {
      ipcRenderer.send('terminal.keystroke', e);
    });

    fitAddon.fit();
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

  // function carlo() {
  //   console.log('Carlo function has been invoked!');
  // }
  // window.addEventListener('DOMContentLoaded', () => {
  //   // Terminal
  //   const term = new Terminal();
  //   const fitAddon = new FitAddon();
  //   term.loadAddon(fitAddon);

  //   // Open the terminal in #terminal-container
  //   term.open(document.getElementById('terminal-container'));

  //   ipcRenderer.on("terminal.incomingData", (event, data) => {
  //     term.write(data);
  //   });

  //   term.onData(e => {
  //     ipcRenderer.send("terminal.keystroke", e);
  //   });

  //   // Make the terminal's size and geometry fit the size of #terminal-container
  //   fitAddon.fit();
  // });
});
