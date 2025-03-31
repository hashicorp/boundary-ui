/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexController extends Controller {
  @controller('application') application;

  // =services

  @service store;
  @service ipc;
  @service session;

  //actions
  /**
   * Calls the Application controller's toggleTheme method
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  toggleTheme({ target: { value: theme } }) {
    return this.application.toggleTheme(theme);
  }

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    // Check if there are any active sessions before invalidating
    const sessions = this.store.peekAll('session');
    sessions.forEach(async (session) => {
      await this.ipc.invoke('stop', { session_id: session.id });
    });

    this.session.invalidate();
  }
}
