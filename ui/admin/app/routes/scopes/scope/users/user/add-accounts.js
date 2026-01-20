/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeUsersUserAddAccountsRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Empty out any previously loaded accounts.
   */
  beforeModel() {
    this.store.unloadAll('account');
  }

  /**
   * Returns the current user, all auth methods, and all accounts.
   * @return {{user: UserModel, authMethods: [AuthMethodModel], accounts: [AccountModel]}}
   */
  async model() {
    const user = this.modelFor('scopes.scope.users.user');
    const { id: scope_id } = this.modelFor('scopes.scope');
    const authMethods = await this.store.query('auth-method', {
      scope_id,
      query: { filters: { scope_id: [{ equals: scope_id }] } },
    });
    await Promise.all(
      authMethods.map(({ id: auth_method_id }) =>
        this.store.query('account', { auth_method_id }),
      ),
    );
    const accounts = this.store.peekAll('account');
    return { user, authMethods, accounts };
  }
}
