/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountRoute extends Route {
  // =services

  @service store;

  // =methods

  /**
   * Load an account by ID.
   * @param {object} params
   * @param {string} params.account_id
   * @return {AccountModel}
   */
  model({ account_id }) {
    return this.store.findRecord('account', account_id, { reload: true });
  }
}
