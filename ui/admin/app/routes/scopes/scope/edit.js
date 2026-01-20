/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeEditRoute extends Route {
  // =services

  @service session;
  @service router;
  @service store;
  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Adds storage policy name to the context.
   * @param {Controller} controller
   * @param {PolicyModel} policy
   */
  async setupController(controller, policy) {
    super.setupController(...arguments);
    if (policy.storage_policy_id) {
      const { storage_policy_id } = policy;
      const record = await this.store.findRecord('policy', storage_policy_id);
      controller.set('storage_policy', record);
    }
  }
}
