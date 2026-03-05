/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * This terminal renderer bootstraps an xterm.js instance and connects it to the Electron main process
 * via the `window.terminal` API exposed by the preload `terminal-preload.js`.
 */

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { CanvasAddon } from '@xterm/addon-canvas';
import { v4 as uuidv4 } from 'uuid';
import '@xterm/xterm/css/xterm.css';
import './terminal.css';

const terminalOptions = {
  cursorBlink: true,
};
const terminalId = uuidv4();
const terminalElement = document.getElementById('terminal');
const xterm = new Terminal(terminalOptions);
const fitAddon = new FitAddon();
const canvasAddon = new CanvasAddon();

xterm.loadAddon(fitAddon);
xterm.loadAddon(canvasAddon);

xterm.open(terminalElement);
fitAddon.fit();
xterm.focus();

/**
 * Custom key event handler for windows to achieve Ctrl+C as on the other OS's
 */
const isWindows = navigator.userAgent.toLowerCase().includes('win');
if (isWindows) {
  xterm.attachCustomKeyEventHandler(async (arg) => {
    if (arg.ctrlKey && arg.code === 'KeyC' && arg.type === 'keydown') {
      const selection = xterm.getSelection();
      if (selection) {
        await navigator.clipboard.writeText(selection);
        return false;
      }
    }
    return true;
  });
}

// create terminal through the terminal API exposed by terminal-preload script
window.terminal.create({
  id: terminalId,
  cols: xterm.cols,
  rows: xterm.rows,
});

xterm.onData((data) => {
  window.terminal.send(data, terminalId);
});

window.terminal.receive((value) => {
  xterm.write(value);
}, terminalId);

xterm.onResize((size) => {
  window.terminal.resize(size, terminalId);
});

const resizeObserver = new ResizeObserver(() => {
  fitAddon.fit();
});

resizeObserver.observe(terminalElement);

window.terminal.cleanup(() => {
  resizeObserver.disconnect();
  xterm.dispose();
  window.terminal.remove(terminalId);
});
