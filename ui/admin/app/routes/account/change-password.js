import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { notifySuccess, notifyError } from 'core/decorators/notify';

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
    await this.router.replaceWith('index').catch(() => {});
  }

  /**
   * On cancel, redirects to index route for further processing.
   */
  @action
  cancel() {
    this.router.replaceWith('index');
  }
}
