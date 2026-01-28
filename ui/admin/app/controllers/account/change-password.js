/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class AccountChangePasswordController extends Controller {
  // =services

  @service session;
  @service router;

  // =actions

  /**
   * Changes the password on the account and then redirects to the index route.
   * @param {AccountModel} account
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  @action
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.save-success')
  async changePassword(account, currentPassword, newPassword) {
    await account.changePassword(currentPassword, newPassword);
    // Transition to index after success.  We ignore errors in the transition,
    // since the index route is responsible for additional
    // redirects depending on the authentication context.  These additional
    // redirects may abort this initial transition, resulting in a
    // TransitionAborted error, which we do not want to show to the user.
    try {
      await this.router.replaceWith('index');
    } catch (e) {
      // no-op
    }
  }

  /**
   * On cancel, redirects to index route for further processing.
   */
  @action
  cancel() {
    this.router.replaceWith('index');
  }
}
