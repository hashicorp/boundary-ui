/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash, all } from 'rsvp';

export default class ScopesScopeUsersUserAccountsRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Returns users associated with this user.
   * @return {Promise{user: UserModel, accounts: Promise{[AccountModel]}}}
   */
  model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    const user = this.modelFor('scopes.scope.users.user');
    return hash({
      user,
      accounts: all(
        user.account_ids.map((id) =>
          this.store.findRecord('account', id, { adapterOptions: { scopeID } }),
        ),
      ),
    });
  }
}
