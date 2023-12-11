import Service from '@ember/service';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { loading } from 'ember-loading';
import { confirm } from 'core/decorators/confirm';
import { notifySuccess, notifyError } from 'core/decorators/notify';

export default class AccountActionsService extends Service {
  @service store;
  @service intl;
  @service can;
  @service router;

  /**
   * Delete an account in current scope and redirect to index
   * @param {AccountModel} account
   */
  @action
  @loading
  @confirm('questions.delete-confirm')
  @notifyError(({ message }) => message, { catch: true })
  @notifySuccess('notifications.delete-success')
  async delete(account) {
    await account.destroyRecord();
    await this.router.replaceWith(
      'scopes.scope.auth-methods.auth-method.accounts',
    );
    this.router.refresh();
  }

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
}
