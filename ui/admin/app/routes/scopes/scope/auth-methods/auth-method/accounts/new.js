/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsNewRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Creates a new unsaved account in current scope.
   * @return {AccountModel}
   */
  model() {
    const { id: auth_method_id, type } = this.modelFor(
      'scopes.scope.auth-methods.auth-method'
    );
    return this.store.createRecord('account', {
      type,
      auth_method_id,
    });
  }
}
