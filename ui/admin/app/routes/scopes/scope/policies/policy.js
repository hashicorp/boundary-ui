/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopePoliciesPolicyRoute extends Route {
  @service store;
  @service can;

  // =methods

  /**
   * Load a policy in current scope.
   * @param {object} params
   * @param {string} params.policy_id
   * @return {Promise{PolicyModel}}
   */
  async model({ policy_id }) {
    return this.store.findRecord('policy', policy_id, {
      reload: true,
    });
  }
}
