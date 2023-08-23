/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

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
    const { proxy_address, proxy_port } = model;
    // Window is exposed by contextBridge within preload script.
    window.terminal.open('terminal-container');
    // Send command
    window.terminal.openSsh(proxy_address, proxy_port);
  }
}
