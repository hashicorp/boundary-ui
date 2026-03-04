/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

const { isWindows } = require('../helpers/platform.js');
const pty = require('node-pty');
const sessionManager = require('../services/session-manager.js');
const { WebContentsView, BrowserWindow } = require('electron');
const path = require('path');

class TerminalManager {
  #terminalView = null;
  #sessionId = null;
  #autoSSH = false;

  get mainWindow() {
    return BrowserWindow.getAllWindows()[0];
  }

  createTerminal(ipcMain, event, payload) {
    const { id, cols, rows } = payload;
    const terminalShell = isWindows()
      ? 'powershell.exe'
      : process.env.SHELL || '/bin/bash';
    const ptyProcess = pty.spawn(terminalShell, [], {
      name: 'xterm-color',
      cols,
      rows,
      cwd: process.env.HOME,
      env: process.env,
    });

    // If autoSSH is enabled, we need to send the SSH command to the terminal once it's created
    if (this.#autoSSH) {
      const session = sessionManager.getSessionById(this.#sessionId);
      const {
        proxyDetails: { address, port },
      } = session;
      const sshCommand = `ssh ${address} -p ${port} -o NoHostAuthenticationForLocalhost=yes\r`;
      ptyProcess.write(sshCommand);
    }

    const incomingDataChannel = `terminalIncomingData-${id}`;
    const resizeChannel = `resizeTerminal-${id}`;
    const removeChannel = `removeTerminal-${id}`;
    const keystrokeChannel = `terminalKeystroke-${id}`;

    ptyProcess.on('data', (data) => {
      event.sender.send(incomingDataChannel, data);
    });

    ipcMain.on(keystrokeChannel, (event, value) => {
      ptyProcess.write(value);
    });

    // Resize listener
    const resizeListener = (event, size) => {
      const { cols, rows } = size;
      ptyProcess.resize(cols, rows);
    };
    ipcMain.on(resizeChannel, resizeListener);

    const cleanup = () => {
      try {
        ptyProcess.kill();
      } finally {
        // Clean up all IPC listeners
        ipcMain.removeListener(resizeChannel, resizeListener);
        ipcMain.removeAllListeners(removeChannel);
        ipcMain.removeAllListeners(keystrokeChannel);
      }
    };

    ipcMain.once(removeChannel, cleanup);
  }

  /**
   * Creates a terminal view and adds it to the main window. The terminal view is sandboxed and has a preload script that sets up IPC communication for sending keystrokes and receiving data.
   * @param {Object} vars - Variables for terminal creation
   * @param {Object} position - The position and size of the terminal view
   * @param {string} id - An optional identifier for the terminal session
   * @param {boolean} autoSSH - Whether to automatically send an SSH command to the terminal upon creation
   */
  createTerminalView({ position, id = null, autoSSH = false }) {
    this.#sessionId = id;
    this.#autoSSH = autoSSH;
    this.#terminalView = new WebContentsView({
      webPreferences: {
        sandbox: true,
        webSecurity: true,
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, '..', 'terminal-preload.js'),
      },
    });

    const terminalViewPath = path.join(
      __dirname,
      '..',
      '..',
      'terminal-view-dist',
      'terminal.html',
    );
    this.mainWindow.contentView.addChildView(this.#terminalView);
    this.positionTerminalView(position);
    this.#terminalView.webContents.loadFile(terminalViewPath);
  }

  positionTerminalView(position) {
    this.#terminalView.setBounds(position);
  }

  hideTerminalView() {
    this.#terminalView.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  }

  destroyTerminalView() {
    this.#terminalView.webContents.send('cleanupTerminal');
    this.mainWindow.contentView.removeChildView(this.#terminalView);
    this.#terminalView = null;
    this.#sessionId = null;
    this.#autoSSH = false;
  }
}

module.exports = new TerminalManager();
