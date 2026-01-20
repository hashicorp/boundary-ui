/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  // =services

  @service router;

  // =methods

  /**
   * Redirects to scopes route for further processing.
   */
  redirect() {
    this.router.transitionTo('scopes');
  }
}
