/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  // =services

  @service ipc;
  @service session;
  @service clusterUrl;
  @service flashMessages;

  // =tracked properties

  @tracked isLoggingOut = false;
  @tracked isAppQuitting = false;

  // =attributes
  removeListener;

  constructor() {
    super(...arguments);

    // Listen for when user attempts to quit app
    // Setup removeListener to destroy the process after
    this.removeListener = window.electron.onAppQuit(() => {
      this.isAppQuitting = true;
    });
  }

  // =actions

  /**
   * Stop all active/pending target sessions
   * Logout or close app
   */
  @action
  async confirmCloseSessions() {
    this.stopAll();
    if (this.isAppQuitting) {
      // We have to set the logout modal to false to ensure it does not
      // render if user first attempted to signout, setting isLoggingOut to true
      this.isLoggingOut = false;
      this.isAppQuitting = false;
      this.close();
    } else {
      this.isLoggingOut = false;
      this.session.invalidate();
    }
  }

  /**
   * Only render the sigout modal if sessions are running
   */
  @action
  async checkForSessionsRunning() {
    const hasRunningSessions = await this.ipc.invoke('hasRunningSessions');
    if (hasRunningSessions) {
      this.isLoggingOut = true;
    } else {
      this.session.invalidate();
    }
  }

  /**
   * Disconnects from clusterUrl and invalidates session, thereby resetting
   * the client and reloading to the onboarding clusterUrl screen.
   */
  @action
  disconnect() {
    this.clusterUrl.resetClusterUrl();
    this.confirmCloseSessions();
  }

  @action
  minimize() {
    this.ipc.invoke('minimizeWindow');
  }

  @action
  toggleFullScreen() {
    this.ipc.invoke('toggleFullscreenWindow');
  }

  @action
  close() {
    this.ipc.invoke('closeWindow');
  }

  @action
  stopAll() {
    this.ipc.invoke('stopAll');
  }

  /**
   * Applies the specified color theme to the root ember element.
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  toggleTheme(theme) {
    const rootElementSelector = getOwner(this).rootElement;
    const rootEl = getOwner(this)
      .lookup('service:-document')
      .querySelector(rootElementSelector);
    this.session.set('data.theme', theme);
    switch (theme) {
      case 'light':
        rootEl.classList.add('rose-theme-light');
        rootEl.classList.remove('rose-theme-dark');
        break;
      case 'dark':
        rootEl.classList.add('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
        break;
      default:
        rootEl.classList.remove('rose-theme-dark');
        rootEl.classList.remove('rose-theme-light');
    }
  }

  @action
  cancel() {
    this.isLoggingOut = false;
    this.isAppQuitting = false;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    if (this.removeListener) {
      this.removeListener();
    }
  }
}
