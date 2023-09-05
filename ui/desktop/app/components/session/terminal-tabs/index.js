import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { v4 as uuidv4 } from 'uuid';

export default class SessionTerminalTabsComponent extends Component {
  terminal;

  // =actions

  @action
  openTerminal() {
    // Don't re-initialize the terminal if it's already been opened
    if (this.terminal) {
      return;
    }

    const xterm = new Terminal();
    this.terminal = xterm;
    const fitAddon = new FitAddon();
    const termContainer = document.getElementById(`terminal-container`);

    // TODO: Do we need the fit addon?
    xterm.loadAddon(fitAddon);
    xterm.open(termContainer);
    fitAddon.fit();

    // Generate a UUID to have the terminal handlers be unique
    const id = uuidv4();

    // Terminal is exposed by contextBridge within the preload script.
    window.terminal.create({ id });
    xterm.onData((data) => window.terminal.send(data, id));
    window.terminal.receive((event, value) => {
      xterm.write(value);
    }, id);

    const model = this.args.model;
    if (model.target?.isSSH) {
      const { proxy_address, proxy_port } = model;

      // Send an SSH command immediately
      window.terminal.send(`ssh ${proxy_address} -p ${proxy_port}\r`, id);
    }
  }
}
