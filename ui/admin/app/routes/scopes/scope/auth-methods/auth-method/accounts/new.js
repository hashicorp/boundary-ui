/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsNewRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Redirect to parent route when auth-method does not have create authorized action.
   */
  beforeModel() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    if (
      this.can.cannot('create model', authMethod, { collection: 'accounts' })
    ) {
      this.router.replaceWith('scopes.scope.auth-methods.auth-method.accounts');
    }
  }

  /**
   * Creates a new unsaved account in current scope.
   * @return {AccountModel}
   */
  model() {
    const { id: auth_method_id, type } = this.modelFor(
      'scopes.scope.auth-methods.auth-method',
    );
    return this.store.createRecord('account', {
      type,
      auth_method_id,
    });
  }
}
