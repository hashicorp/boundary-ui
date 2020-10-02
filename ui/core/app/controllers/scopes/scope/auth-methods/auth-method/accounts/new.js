import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodAccountsNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated new account breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('titles.new');
  }
}
