/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeUsersUserAddAccountsController extends Controller {
  // =services

  @service router;

  // =actions

  /**
   * Adds accounts to the user and saves, replaces with the accounts index
   * route, and notifies the user of success or error.
   * @param {UserModel} user
   * @param {[string]} accountIDs
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.add-success')
  async addAccounts(user, accountIDs) {
    await user.addAccounts(accountIDs);
    await this.router.replaceWith('scopes.scope.users.user.accounts');
  }

  /**
   * Redirect to user accounts as if nothing ever happened.
   */
  @action
  cancel() {
    this.router.replaceWith('scopes.scope.users.user.accounts');
  }
}
