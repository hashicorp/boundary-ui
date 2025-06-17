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

  @tracked showSignoutModal = false;

  // =actions

  /**
   * Hide signout modal, stop all active and pending target sessions
   * De-authenticate user session
   */
  @action
  invalidateSession() {
    this.showSignoutModal = false;
    this.stopAll();
    this.session.invalidate();
    this.ipc.invoke('setSignoutInProgress', false);
  }

  /**
   * Disconnects from clusterUrl and invalidates session, thereby resetting
   * the client and reloading to the onboarding clusterUrl screen.
   */
  @action
  disconnect() {
    this.clusterUrl.resetClusterUrl();
    this.invalidateSession();
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
  signoutAttempt() {
    this.showSignoutModal = true;
    // Prevents a user from quitting app while signout modal is present
    this.ipc.invoke('setSignoutInProgress', true);
  }

  @action
  cancelSignout() {
    this.showSignoutModal = false;
    this.ipc.invoke('setSignoutInProgress', false);
  }
}
