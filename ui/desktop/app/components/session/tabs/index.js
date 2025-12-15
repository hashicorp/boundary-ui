/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { CanvasAddon } from '@xterm/addon-canvas';
import { v4 as uuidv4 } from 'uuid';
import debounce from 'lodash/debounce';

const terminalOptions = {
  cursorBlink: true,
};

// This dynamically sets the terminal container's height inline so we have an accurate
// height for the terminal container. This is necessary because we don't have an
// intrinsic height from our parent containers and we don't have any content yet from
// the terminal to have a usable height for the container. This means that calling `.fit()`
// doesn't get an accurate representation of what the container size can actually be
const calculateTerminalContainerHeight = (termContainer) => {
  const viewportHeight = window.innerHeight;
  // Calculate the height by getting the viewport height, subtracting what
  // the top offset from the container is, and leaving a small padding to
  // also prevent any overflow scrolling on the container
  const height = viewportHeight - termContainer.offsetTop - 24;
  termContainer.style.height = `${height}px`;
};

export default class SessionTerminalTabsComponent extends Component {
  // =services

  @service ipc;

  // =attributes

  id;
  terminal;
  removeTerminalListener;

  // =actions

  @action
  async openTerminal() {
    // Don't re-initialize the terminal if it's already been opened
    if (this.terminal) {
      return;
    }

    const { isWindows } = await this.ipc.invoke('checkOS');
    const xterm = new Terminal(terminalOptions);
    this.terminal = xterm;
    const fitAddon = new FitAddon();
    const termContainer = document.getElementById(`terminal-container`);
    calculateTerminalContainerHeight(termContainer);

    /**
     * Custom key event handler for windows to achieve Ctrl+C as on the other OS's
     */
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

    xterm.loadAddon(fitAddon);
    xterm.loadAddon(new CanvasAddon());
    xterm.open(termContainer);
    fitAddon.fit();
    xterm.focus();

    // Generate a UUID to have the terminal handlers be unique
    this.id = uuidv4();
    this.#setupTerminal(fitAddon, xterm, termContainer);

    const isSSHCommandAvailable = await this.ipc.invoke('checkCommand', 'ssh');
    const { model } = this.args;

    const { proxy_address, proxy_port, started_desktop_client, target } = model;

    // Only send the command in certain scenarios:
    // 1. Only for SSH targets
    // 2. Don't connect if the session wasn't initiated in the desktop client
    //    which means we won't have proxy information
    // 3. Only connect if the user has an SSH client available in their path
    if (target?.isSSH && started_desktop_client && isSSHCommandAvailable) {
      // Send an SSH command immediately
      window.terminal.send(
        `ssh ${proxy_address} -p ${proxy_port} -o NoHostAuthenticationForLocalhost=yes\r`,
        this.id,
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
    this.removeTerminalListener?.();
  }

  #setupTerminal(fitAddon, xterm, termContainer) {
    // Terminal is exposed by contextBridge within the preload script
    window.terminal.create({ id: this.id, cols: xterm.cols, rows: xterm.rows });
    xterm.onData((data) => window.terminal.send(data, this.id));

    // Save the handler to cleanup the listener on the renderer process later
    this.removeTerminalListener = window.terminal.receive((value) => {
      xterm.write(value);
    }, this.id);

    // Handle resizing terminal windows. We debounce the resizing as we don't want
    // to resize xterm and the pty process before the previous one has finished
    const debouncedFit = debounce(() => {
      calculateTerminalContainerHeight(termContainer);
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
