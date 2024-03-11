/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountSetPasswordController extends Controller {
  // =controllers

  @controller('scopes/scope/auth-methods/auth-method/accounts/index') accounts;

  // =services

  @service router;

  // =actions

  /**
   * Set password for the specified account.
   * @param {AccountModel} account
   * @param {string} password
   */
  @action
  @loading
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async setPassword(account, password) {
    await account.setPassword(password);
    await this.router.replaceWith(
      'scopes.scope.auth-methods.auth-method.accounts.account.set-password',
    );
  }
}
