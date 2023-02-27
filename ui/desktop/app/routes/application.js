/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';
import { loading } from 'ember-loading';

export default class ApplicationRoute extends Route {
  // =services

  @service session;
  @service clusterUrl;
  @service ipc;
  @service intl;

  // =attributes

  /**
   * @type {string}
   */
  routeIfUnauthenticated = 'index';

  /**
   * Check that the clusterUrl specified in the renderer matches the clusterUrl
   * reported by the main process.  If they differ, update the main process
   * clusterUrl so that the renderer's CSP can be rewritten to allow requests.
   */
  async beforeModel() {
    this.intl.setLocale(['en-us']);
    await this.session.setup();
    const theme = this.session.get('data.theme');
    this.toggleTheme(theme);
    return this.clusterUrl.updateClusterUrl();
  }

  /**
   * Add window frame config on controller.
   */
  async setupController(controller) {
    controller.set('hasMacOSChrome', await this.ipc.invoke('hasMacOSChrome'));
    controller.set(
      'showWindowActions',
      await this.ipc.invoke('showWindowActions')
    );
  }

  // =actions

  /**
   * Delegates invalidation to the session service.
   */
  @action
  invalidateSession() {
    this.session.invalidate();
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

  /**
   * Hooks into ember-loading to kick off loading indicator in the
   * application template.
   * @return {boolean} always returns true
   */
  @action
  @loading
  loading() {
    return true;
  }

  /**
   * Invalidates the session if a 401 error occurs and returns false to
   * prevent further error handling.
   * Returns true in all other cases, allowing error handling to occur (such
   * as displaying the `error.hbs` template, if one exists).
   * @param {Error} e
   */
  @action
  error(e) {
    const isUnauthenticated = A(e?.errors)?.firstObject?.isUnauthenticated;
    if (isUnauthenticated) {
      this.session.invalidate();
      return false;
    }
    return true;
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
}
