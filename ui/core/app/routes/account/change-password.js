import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

/**
 * The change password flow is associated only with password-type auth methods.
 */
export default class AccountChangePasswordRoute extends Route {

  // =services

  @service session;
  @service intl;
  @service notify;

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
  async changePassword(account, currentPassword, newPassword) {
    try {
      await account.changePassword(currentPassword, newPassword);
      // Transition to index after success.  We ignore errors in the transition,
      // since the index route is responsible for additional
      // redirects depending on the authentication context.  These additional
      // redirects may abort this initial transition, resulting in a
      // TransitionAborted error, which we do not want to show to the user.
      await this.replaceWith('index').catch(() => {});
      this.notify.success(this.intl.t('notify.save-success'));
    } catch (error) {
      // TODO: replace with translated strings
      this.notify.error(error.message, { closeAfter: null });
    }
  }

  /**
   * On cancel, redirects to index route for further processing.
   */
  @action
  cancel() {
    this.replaceWith('index');
  }

}
