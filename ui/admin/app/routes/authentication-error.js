/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticationErrorRoute extends Route {
  // =services

  @service('browser/window') window;

  // =methods

  /**
   * @return {string}
   */
  model() {
    return this.window.location.toString();
  }
}
