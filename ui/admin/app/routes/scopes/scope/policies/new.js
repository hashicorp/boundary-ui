/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopePoliciesNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved storage policy.
   * @return {Policy}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('policy');
    record.scopeModel = scopeModel;
    return record;
  }
}
