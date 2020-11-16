import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeUsersUserAddAccountsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.user.messages.add-accounts.title');
  }
}
