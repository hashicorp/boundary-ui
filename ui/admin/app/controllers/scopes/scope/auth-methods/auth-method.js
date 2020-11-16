import Controller from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodController extends Controller {
  // =attributes

  /**
   * An auth-method breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
