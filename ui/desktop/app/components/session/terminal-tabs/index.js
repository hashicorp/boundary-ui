import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';

const terminalOptions = {
  cursorBlink: true,
};

export default class SessionTerminalTabsComponent extends Component {
  // =attributes

  id;
  terminal;

  // =actions

  @action
  openTerminal() {
    // Don't re-initialize the terminal if it's already been opened
    if (this.terminal) {
      return;
    }

    const xterm = new Terminal(terminalOptions);
    this.terminal = xterm;
    const fitAddon = new FitAddon();
    const termContainer = document.getElementById(`terminal-container`);

    xterm.loadAddon(fitAddon);
    xterm.open(termContainer);
    fitAddon.fit();
    xterm.focus();

    // Generate a UUID to have the terminal handlers be unique
    const id = uuidv4();
    this.id = id;

    setupTerminal(fitAddon, xterm, id);

    const { model } = this.args;
    if (model.target?.isSSH) {
      const { proxy_address, proxy_port } = model;

      // Send an SSH command immediately
      window.terminal.send(`ssh ${proxy_address} -p ${proxy_port}\r`, id);
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    // Clean up event listeners
    window.onresize = null;
    if (this.terminal) {
      this.terminal.dispose();
    }

    // TODO: Cleanup underlying terminal
  }
}

const setupTerminal = (fitAddon, xterm, id) => {
  // Terminal is exposed by contextBridge within the preload script
  window.terminal.create({ id, cols: xterm.cols, rows: xterm.rows });
  xterm.onData((data) => window.terminal.send(data, id));
  window.terminal.receive((event, value) => {
    xterm.write(value);
  }, id);

  // Handle resizing terminal windows. We debounce the resizing as we
  // don't want to resize xterm and the pty process before the previous
  // one has finished
  const debouncedFit = debounce(() => {
    fitAddon.fit();
  }, 150);
  window.onresize = () => {
    debouncedFit();
  };
  xterm.onResize((size) => {
    window.terminal.resize(size, id);
  });
};
