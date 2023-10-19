/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  beforeModel() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    if (
      this.can.cannot('create model', authMethod, {
        collection: 'managed-groups',
      })
    ) {
      this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.managed-groups',
        authMethod.scopeID,
        authMethod.id
      );
    }
  }

  model() {
    const { id: auth_method_id, type } = this.modelFor(
      'scopes.scope.auth-methods.auth-method'
    );
    return this.store.createRecord('managed-group', {
      type,
      auth_method_id,
    });
  }
}
