/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeEditRoute extends Route {
  // =services

  @service session;
  @service router;
  @service store;
  @service abilities;
  // =methods

  /**
   * If arriving here unauthenticated, redirect to index for further processing.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) this.router.transitionTo('index');
  }

  /**
   * Refresh the alias suffix for project scopes.
   * @param {ScopeModel} scope
   */
  async afterModel(scope) {
    if (this.abilities.can('getAliasSuffix scope', scope)) {
      try {
        await this.store.findRecord('scope', scope.id, {
          adapterOptions: { method: 'get-alias-target-suffix' },
          reload: true,
        });
      } catch {
        // do nothing
      }
    }
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
