/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class ScopesScopeAuthMethodsAuthMethodAccountsRoute extends Route {
  // =services

  @service store;
  @service intl;
  @service can;
  @service router;

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

  // =actions

  /**
   * Save an account in current scope.
   * @param {AccountModel} account
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  @notifySuccess(({ isNew }) =>
    isNew ? 'notifications.create-success' : 'notifications.save-success',
  )
  async save(account, password) {
    const { isNew } = account;
    const adapterOptions = {};
    if (isNew) {
      adapterOptions.password = password;
    }
    await account.save({ adapterOptions });
    if (this.can.can('read model', account)) {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.accounts.account',
        account,
      );
    } else {
      await this.router.transitionTo(
        'scopes.scope.auth-methods.auth-method.accounts',
      );
    }
    this.refresh();
  }
}
