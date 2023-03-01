/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsNewRoute extends Route {
  // =services

  @service store;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Create a new unsaved auth-method.
   * @return {AuthMethodModel}
   */
  model(params) {
    const scopeModel = this.modelFor('scopes.scope');
    const record = this.store.createRecord('auth-method', {
      type: params.type,
    });
    record.scopeModel = scopeModel;
    return record;
  }
}
