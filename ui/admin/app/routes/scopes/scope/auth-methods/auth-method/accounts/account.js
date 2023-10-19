/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
   * @return {AccountModel}
   */
  async model({ account_id }) {
    return this.store.findRecord('account', account_id, { reload: true });
  }

  redirect(account, transition) {
    const authMethod = this.modelFor('scopes.scope.auth-methods.auth-method');
    const { auth_method_id } = account;
    if (
      this.can.cannot('read account', account, {
        resource_id: auth_method_id,
        collection_id: authMethod.id,
      })
    ) {
      this.router.transitionTo(transition.to.name, auth_method_id, account.id);
    }
  }
}
