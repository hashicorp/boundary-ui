/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

export default class ScopesScopeProjectsSettingsIndexController extends Controller {
  @controller('application') application;

  //actions
  /**
   * Calls the Application controller's toggleTheme method
   * @param {string} theme - "light", "dark", or nullish (system default)
   */
  @action
  toggleTheme({ target: { value: theme } }) {
    console.log('toggleTheme', theme);
    return this.application.toggleTheme(theme);
  }
}
