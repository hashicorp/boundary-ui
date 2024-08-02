/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

const THEMES = [
  {
    label: 'system',
    value: 'system-default-theme',
  },
  {
    label: 'light',
    value: 'light',
  },
  {
    label: 'dark',
    value: 'dark',
  },
];

export default class ScopesScopeProjectsSettingsIndexController extends Controller {
  @controller('application') application;
  // Services

  @service session;

  // Methods

  /**
   * Returns available themes
   */
  get themes() {
    return THEMES;
  }

   /**
 * Returns the username of the current user
 * @type {string}
 */
  get userInfo() {
    const {
      data: {
        authenticated: { username },
      },
    } = this.session;
    return username;
  }

  /**
   * Returns true if user is authenticated
   * @type {boolean}
   */
  get isAuthenticated() {
    const { isAuthenticated } = this.session;
    return isAuthenticated;
  }
 
  /**
  * Returns the type of authmethod used by the user
  * @type {string}
  */
  get authMethod() {
    const {
      data: {
        authenticated: { authenticator },
      },
    } = this.session;
    const formattedAuthenticator = authenticator.split(':')[1];
    return formattedAuthenticator;
  }

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
    this.session.invalidate();
  }
}
