import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { CanvasAddon } from '@xterm/addon-canvas';
import { v4 as uuidv4 } from 'uuid';
import '@xterm/xterm/css/xterm.css';
import './terminal.css';

// const { isWindows } = require('../helpers/platform.js');
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

// create terminal
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
