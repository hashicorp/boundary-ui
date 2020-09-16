import Controller from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodAccountsAccountController extends Controller {
  // =attributes

  /**
   * An account breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
