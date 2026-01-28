/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAddStoragePolicyIndexRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Load policies from current scope
   * @param {Model} model
   */
  async afterModel() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const currentScopePolicies = await this.store.query('policy', {
      scope_id,
    });

    if (scope_id === 'global') {
      // Global scope should only list policies from its scope
      this.policyList = currentScopePolicies;
    } else {
      // Org scope should list both global and org scope policies
      const globalScopePolicies = await this.store.query('policy', {
        scope_id: 'global',
      });

      this.policyList = [...globalScopePolicies, ...currentScopePolicies];
    }
  }

  /**
   * Adds `policyList` to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('policyList', this.policyList);
  }
}
