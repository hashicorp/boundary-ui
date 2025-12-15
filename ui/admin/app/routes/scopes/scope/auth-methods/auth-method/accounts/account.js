/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountRoute extends Route {
  // =services

  @service store;
  @service can;
  @service router;

  // =methods

  /**
   * Load an account by ID.
   * @param {object} params
   * @param {string} params.account_id
   * @return {Promise{AccountModel}}
   */
  async model({ account_id }) {
    return this.store.findRecord('account', account_id, { reload: true });
  }

  /**
   * Redirects to route with correct auth-method id if incorrect.
   * @param {AccountModel} account
   * @param {object} transition
   */
  redirect(account, transition) {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { auth_method_id } = account;
    if (auth_method_id !== authMethod.id) {
      this.router.replaceWith(transition.to.name, auth_method_id, account.id);
    }
  }
}
