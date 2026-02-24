/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ApplicationController extends Controller {
  // =services

  @service clusterUrl;
  @service flashMessages;
  @service ipc;
  @service session;
  @service('browser/window') window;

  // =attributes

  @tracked isLoggingOut = false;
  @tracked isAppQuitting = false;

  removeOnAppQuitListener;

  constructor() {
    super(...arguments);
    // Listen for when user attempts to quit app
    // Setup removeOnAppQuitListener to destroy the listener afterwards
    this.removeOnAppQuitListener = this.window.electron?.onAppQuit(() => {
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
    await this.ipc.invoke('stopAll');
    if (this.isAppQuitting) {
      this.isAppQuitting = false;
      this.close();
    } else {
      // this.session.invalidate() comes from Ember Simple Auth BaseSessionService
      this.session.invalidate();
    }

    this.isLoggingOut = false;
  }

  /**
   * Only renders the signout modal if target sessions are running
   */
  @action
  async showModalOrLogout() {
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
    this.session.invalidate();
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
    this.removeOnAppQuitListener?.();
  }
}
