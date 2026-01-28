/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

/**
 * The change password flow is associated only with password-type auth methods.
 */
export default class AccountChangePasswordRoute extends Route {
  // =services

  @service store;
  @service session;
  @service intl;

  @service router;

  // =methods

  /**
   * Loads the account associated with the auth token.
   * @return {?AccountModel}
   */
  model() {
    const account_id = this.session?.data?.authenticated?.account_id;
    return this.store.findRecord('account', account_id);
  }
}
