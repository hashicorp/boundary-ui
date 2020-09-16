import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated accounts breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.accounts');
  }
}
