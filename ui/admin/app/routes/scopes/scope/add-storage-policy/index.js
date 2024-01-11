/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAddStoragePolicyIndexRoute extends Route {
  // =services
  @service store;
  @service router;

  // =methods

  /**
   * Load polcies from global and current scope
   * @param {Model} model
   */
  async afterModel() {
    const { id: scope_id } = this.modelFor('scopes.scope');

    //fetch policies from global scope
    const globalScopePolicies = await this.store.query('policy', {
      scope_id: 'global',
    });

    //fetch policies from org scope
    const orgScopePolicies = await this.store.query('policy', {
      scope_id,
    });

    const policyList = [...globalScopePolicies, ...orgScopePolicies];

    this.policyList = policyList;
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
