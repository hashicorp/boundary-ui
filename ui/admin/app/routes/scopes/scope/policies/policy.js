/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopePoliciesPolicyRoute extends Route {
  @service store;
  @service can;
  @service router;

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
