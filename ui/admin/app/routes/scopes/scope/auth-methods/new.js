/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.can.cannot('create model', scopeModel, {
        collection: 'auth-methods',
      })
    ) {
      this.router.transitionTo('scopes.scope.auth-methods', scopeModel.id);
    }
  }

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
