import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountSetPasswordController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated users breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('actions.set-password');
  }
}
