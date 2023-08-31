/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

export default class ScopesScopeProjectsSessionsSessionRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load a session
   * @param {object} params
   * @param {string} params.session_id
   * @return {SessionModel}
   */
  model({ session_id }) {
    return this.store.findRecord('session', session_id, {
      reload: true,
    });
  }

  // =actions

  @action
  async openTerminal(model) {
    const xterm = new Terminal();
    const fitAddon = new FitAddon();
    const termContainer = document.getElementById('terminal-container');

    // TODO: Do we need the fit addon?
    xterm.loadAddon(fitAddon);
    xterm.open(termContainer);
    fitAddon.fit();

    // Terminal is exposed by contextBridge within the preload script.
    xterm.onData((data) => window.terminal.send(data));
    window.terminal.receive((event, value) => {
      xterm.write(value);
    });

    if (model.target?.isSSH) {
      const { proxy_address, proxy_port } = model;

      // Send an SSH command immediately
      window.terminal.send(`ssh ${proxy_address} -p ${proxy_port}\r`);
    }
  }
}
