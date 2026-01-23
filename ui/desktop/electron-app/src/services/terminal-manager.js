const { utilityProcess, clipboard } = require('electron');
const path = require('path');
const { isWindows } = require('../helpers/platform');

class TerminalManager {
  constructor() {
    this.worker = null;
    // map of terminal IDs to their associated sender ( IPC event sender - webContents )
    this.terminalSessions = new Map();
    // tracking focused terminal to handle before-input-event
    this.activeTerminalId = null;
  }

  setActiveTerminal(id) {
    if (id === null) {
      this.activeTerminalId = null;
      return;
    }
    if (this.terminalSessions.has(id)) {
      this.activeTerminalId = id;
    }
  }

  getActiveTerminalId() {
    return this.activeTerminalId;
  }

  convertUserInput(input) {
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

    // character input
    if (key.length === 1) {
      return key;
    }

    return null;
  }

  /**
   * Get or create utility process worker
   */
  getWorker() {
    // create worker if does not exist
    if (!this.worker || this.worker.killed) {
      this.worker = utilityProcess.fork(
        path.join(__dirname, '../workers/terminal-worker.js'),
        [],
        {
          serviceName: 'Terminal Worker',
          stdio: 'pipe',
          env: process.env,
        },
      );

      // Message handler from worker
      this.worker.on('message', ({ type, id, data, error }) => {
        this.handleWorkerMessage(type, id, data, error);
      });

      // Exit handler when worker terminates
      this.worker.on('exit', () => {
        // cleanup
        this.terminalSessions.clear();
        this.worker = null;
      });
    }

    return this.worker;
  }

  /*
   * Handle messages from worker
   */
  handleWorkerMessage(type, id, data, error) {
    const session = this.terminalSessions.get(id);
    if (!session) {
      return;
    }
    switch (type) {
      case 'data':
        session.sender.send(`terminalIncomingData-${id}`, data);
        break;
      case 'exit':
        this.terminalSessions.delete(id);
        break;
      case 'error':
        this.removeTerminal(id);
        break;
    }
  }

  /**
   * Create a new terminal session
   */
  createTerminal(id, cols, rows, sender) {
    if (this.terminalSessions.has(id)) {
      throw new Error('Terminal already exists');
    }

    const shell = isWindows()
      ? 'powershell.exe'
      : process.env.SHELL || '/bin/bash';

    // Store session and associated sender
    this.terminalSessions.set(id, {
      sender,
    });

    // Send create message to worker
    this.getWorker().postMessage({
      action: 'create',
      id,
      data: { cols, rows, shell },
    });
  }

  /**
   * Write data to terminal
   */
  writeToTerminal(id, data, { isSSHCommand = false } = {}) {
    if (!this.terminalSessions.has(id)) {
      throw new Error('Terminal not found');
    }

    // If it's an SSH command, send it directly to worker
    if (isSSHCommand) {
      this.getWorker().postMessage({
        action: 'write',
        id,
        data,
      });
      return;
    }
    const secureData = this.convertUserInput(data);

    if (secureData === null || secureData.length === 0) {
      return;
    }

    // add data validation if needed here

    this.getWorker().postMessage({
      action: 'write',
      id,
      data: secureData,
    });
  }

  /**
   * Resize terminal
   */
  resizeTerminal(id, cols, rows) {
    if (!this.terminalSessions.has(id)) {
      throw new Error('Terminal not found');
    }

    this.getWorker().postMessage({
      action: 'resize',
      id,
      data: { cols, rows },
    });
  }

  /**
   * Destroy terminal session
   */
  removeTerminal(id) {
    if (this.terminalSessions.has(id)) {
      this.getWorker().postMessage({
        action: 'remove',
        id,
      });

      this.terminalSessions.delete(id);
      this.activeTerminalId = null;
    }
  }

  /**
   * Check if terminal exists
   */
  hasTerminal(id) {
    return this.terminalSessions.has(id);
  }

  /**
   * Cleanup all terminals
   */
  stopAll() {
    this.terminalSessions.forEach((_, id) => this.removeTerminal(id));

    if (this.worker && !this.worker.killed) {
      this.worker.kill();
      this.worker = null;
    }
  }
}

module.exports = new TerminalManager();
