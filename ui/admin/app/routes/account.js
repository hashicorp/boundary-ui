/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AccountRoute extends Route {
  // =services

  @service session;
  @service router;

  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing
   * else redirect to change-password route since account route is empty.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) {
      this.router.transitionTo('index');
    } else {
      this.router.transitionTo('account.change-password');
    }
  }
}
