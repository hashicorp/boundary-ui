/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsRoute extends Route {
  // =services

  @service store;
  @service can;

  // =methods

  /**
   * Returns accounts for the current auth method.
   * @return {Promise{[AccountModel]}}
   */
  async model() {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { id: auth_method_id } = authMethod;
    let accounts;

    if (
      this.can.can('list model', authMethod, {
        collection: 'accounts',
      })
    ) {
      accounts = await this.store.query('account', { auth_method_id });
    }

    return {
      authMethod,
      accounts,
    };
  }
}
