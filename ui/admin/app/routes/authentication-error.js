/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
