import Controller from '@ember/controller';

export default class ScopesScopeAuthMethodsIndexController extends Controller {
  // =attributes

  /**
   * True if the current scope has a primary auth method set.
   * @type {boolean}
   */
  get hasPrimaryAuthMethod() {
    return this.scopeModel.primary_auth_method_id;
  }
}
