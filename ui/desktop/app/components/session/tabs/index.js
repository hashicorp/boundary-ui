import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { CanvasAddon } from 'xterm-addon-canvas';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';

const terminalOptions = {
  cursorBlink: true,
};

export default class SessionTerminalTabsComponent extends Component {
  // =services

  @service ipc;

  // =attributes

  id;
  terminal;
  removeListener;

  // =actions

  @action
  async openTerminal() {
    // Don't re-initialize the terminal if it's already been opened
    if (this.terminal) {
      return;
    }

    const xterm = new Terminal(terminalOptions);
    this.terminal = xterm;
    const fitAddon = new FitAddon();
    const termContainer = document.getElementById(`terminal-container`);

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(new CanvasAddon());
    xterm.open(termContainer);
    fitAddon.fit();
    xterm.focus();

    // Generate a UUID to have the terminal handlers be unique
    this.id = uuidv4();
    this.#setupTerminal(fitAddon, xterm);

    const { isWindows } = await this.ipc.invoke('checkOS');
    const { model } = this.args;

    // Don't send the command on windows as most users won't have an openSSH client installed
    if (model.target?.isSSH && !isWindows) {
      const { proxy_address, proxy_port } = model;

      // Send an SSH command immediately
      window.terminal.send(
        `ssh ${proxy_address} -p ${proxy_port} -o NoHostAuthenticationForLocalhost=yes\r`,
        this.id
      );
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    // Kill terminal and clean up event listeners
    if (this.terminal) {
      this.terminal.dispose();
    }
    window.terminal?.remove(this.id);
    window.onresize = null;
    if (this.removeListener) {
      this.removeListener();
    }
  }

  #setupTerminal(fitAddon, xterm) {
    // Terminal is exposed by contextBridge within the preload script
    window.terminal.create({ id: this.id, cols: xterm.cols, rows: xterm.rows });
    xterm.onData((data) => window.terminal.send(data, this.id));

    // Save the handler to cleanup the listener on the renderer process later
    this.removeListener = window.terminal.receive((event, value) => {
      xterm.write(value);
    }, this.id);

    // Handle resizing terminal windows. We debounce the resizing as we don't want
    // to resize xterm and the pty process before the previous one has finished
    const debouncedFit = debounce(() => {
      fitAddon.fit();
    }, 150);
    window.onresize = () => {
      debouncedFit();
    };
    xterm.onResize((size) => {
      window.terminal.resize(size, this.id);
    });
  }
}
