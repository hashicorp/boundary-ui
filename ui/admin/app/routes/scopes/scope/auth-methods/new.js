/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthMethodsNewRoute extends Route {
  // =services

  @service store;
  @service abilities;
  @service router;

  // =attributes

  queryParams = {
    type: {
      refreshModel: true,
    },
  };

  // =methods

  /**
   * Redirect to parent route when scope does not have create authorized action.
   */
  beforeModel() {
    const scopeModel = this.modelFor('scopes.scope');
    if (
      this.abilities.cannot('create model', scopeModel, {
        collection: 'auth-methods',
      })
    ) {
      this.router.replaceWith('scopes.scope.auth-methods');
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
