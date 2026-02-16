const { isWindows } = require('../helpers/platform.js');
const pty = require('node-pty');
const sessionManager = require('../services/session-manager.js');
const { WebContentsView, BrowserWindow, app } = require('electron');
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

    if (this.#autoSSH) {
      const session = sessionManager.getSessionById(this.#sessionId);
      const {
        proxyDetails: { address, port },
      } = session;
      const sshCommand = `ssh ${address} -p ${port} -o NoHostAuthenticationForLocalhost=yes\r`;
      ptyProcess.write(sshCommand);
    }
    const incomingDataChannel = `terminalIncomingData-${id}`;
    const resizeChannel = `resize-${id}`;
    const removeChannel = `removeTerminal-${id}`;
    const keystrokeChannel = `terminalKeystroke-${id}`;
    // Data listener - send data back to renderer
    ptyProcess.on('data', (data) => {
      event.sender.send(incomingDataChannel, data);
    });

    ipcMain.on(keystrokeChannel, (event, value) => {
      ptyProcess.write(value);
    });

    // Resize listener
    const resizeListener = (event, size) => {
      console.log(
        `Resizing terminal listener ${id} to cols: ${size.cols}, rows: ${size.rows}`,
      );
      const { cols, rows } = size;
      ptyProcess.resize(cols, rows);
    };
    ipcMain.on(resizeChannel, resizeListener);

    const cleanup = () => {
      try {
        ptyProcess.kill();
      } finally {
        // Clean up IPC listeners
        ipcMain.removeListener(resizeChannel, resizeListener);
        ipcMain.removeAllListeners(removeChannel);
        ipcMain.removeAllListeners(keystrokeChannel);
      }
    };

    ipcMain.once(removeChannel, cleanup);
  }

  createTerminalView({ position, id = null, autoSSH = false }) {
    this.#sessionId = id;
    this.#autoSSH = autoSSH;
    this.#terminalView = new WebContentsView({
      webPreferences: {
        sandbox: true,
        webSecurity: true,
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, '..', 'terminal-view-preload.js'),
      },
    });

    this.mainWindow.contentView.addChildView(this.#terminalView);
    this.positionTerminalView(position);
    this.#terminalView.webContents.loadFile(
      path.join(
        __dirname,
        '..',
        '..',
        'web-contents-view-dist',
        'terminal.html',
      ),
    );
  }

  positionTerminalView(position) {
    this.#terminalView.setBounds(position);
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
