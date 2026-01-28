const { isWindows } = require('../helpers/platform.js');
const pty = require('node-pty');
const sessionManager = require('../services/session-manager.js');

class TerminalManager {
  constructor() {
    this.terminals = new Map();
    this.activeTerminalId = null;
  }

  getActiveTerminalId() {
    return this.activeTerminalId;
  }

  setActiveTerminalId(id) {
    if (id === null) {
      this.activeTerminalId = null;
      return;
    }
    if (!this.terminals.has(id)) {
      throw new Error(`No terminal registered with id: ${id}`);
    }
    this.activeTerminalId = id;
  }

  registerTerminal(id, ptyProcess) {
    this.terminals.set(id, ptyProcess);
  }

  validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid payload: must be an object');
    }

    const id = payload.id;
    const cols = payload.cols;
    const rows = payload.rows;
    const sessionId = payload.sessionId || null;
    const autoSSH = Boolean(payload.autoSSH);

    if (!id) {
      throw new Error('Invalid payload: id is required');
    }

    return { id, cols, rows, sessionId, autoSSH };
  }

  getTerminalShell() {
    return isWindows() ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
  }

  getTerminalOptions(payload) {
    const { cols, rows } = payload;
    return {
      name: 'xterm-color',
      cols,
      rows,
      cwd: process.env.HOME,
      env: process.env,
    };
  }

  createTerminal(ipcMain, event, payload) {
    const validatedPayload = this.validatePayload(payload);
    const { id, sessionId, autoSSH } = validatedPayload;

    const session = sessionManager.getSessionById(sessionId);

    // validate session before creating terminal
    if (!session) {
      throw new Error(`No session found with id: ${sessionId}`);
    }
    const { sender } = event;

    const terminalShell = this.getTerminalShell();
    const options = this.getTerminalOptions(validatedPayload);
    const ptyProcess = pty.spawn(terminalShell, [], options);

    this.registerTerminal(id, ptyProcess);

    const incomingDataChannel = `terminalIncomingData-${id}`;
    const resizeChannel = `resize-${id}`;
    const removeChannel = `removeTerminal-${id}`;

    // Data listener - send data back to renderer
    ptyProcess.on('data', (data) => {
      sender.send(incomingDataChannel, data);
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
        this.terminals.delete(id);
        if (this.activeTerminalId === id) {
          this.activeTerminalId = null;
        }
      } finally {
        // Clean up IPC listeners
        ipcMain.removeListener(resizeChannel, resizeListener);
        ipcMain.removeAllListeners(removeChannel);
      }
    };

    ipcMain.once(removeChannel, cleanup);

    ptyProcess.once('exit', cleanup);

    // Initialize SSH command for SSH target terminals
    if (autoSSH && session) {
      this.generateSSHCommand({ session, id });
    }
  }

  generateSSHCommand(data) {
    const { session, id } = data;
    if (!this.terminals.has(id)) {
      throw new Error(`No terminal registered with id: ${id}`);
    }

    const {
      proxyDetails: { address, port },
    } = session;
    const sshCommand = `ssh ${address} -p ${port} -o NoHostAuthenticationForLocalhost=yes\r`;

    const ptyProcess = this.terminals.get(id);
    ptyProcess.write(sshCommand);
  }

  /**
   * Handles input received for the active terminal using before-input-event
   */
  handleInputForActiveTerminal(input, activeTerminalId) {
    if (!this.terminals.has(activeTerminalId)) {
      throw new Error(`No terminal registered with id: ${activeTerminalId}`);
    }

    const ptyProcess = this.terminals.get(activeTerminalId);
    const sanitizedData = this.getSecureDataFromInput(input);

    if (sanitizedData && sanitizedData.length !== 0) {
      ptyProcess.write(sanitizedData);
    }
  }

  /**
   * Convert keyboard input into sanitized data for PTY write
   */
  getSecureDataFromInput(input) {
    const { key, control } = input;

    if (key === 'Enter') return '\r';
    if (key === 'Backspace') return '\x7f';
    if (key === 'Tab') return '\t';
    if (key === 'Escape') return '\x1b';

    if (key === 'ArrowUp') return '\x1b[A';
    if (key === 'ArrowDown') return '\x1b[B';
    if (key === 'ArrowRight') return '\x1b[C';
    if (key === 'ArrowLeft') return '\x1b[D';

    if (control && key.length === 1) {
      const code = key.toUpperCase().charCodeAt(0) - 64;
      return String.fromCharCode(code);
    }

    // add cases for copy/paste

    if (key.length === 1) {
      return key;
    }

    return null;
  }

  stopAllTerminals() {
    for (const [id, ptyProcess] of this.terminals) {
      ptyProcess.kill();
    }
    this.terminals.clear();
    this.activeTerminalId = null;
  }
}

module.exports = new TerminalManager();
