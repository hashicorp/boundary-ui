import Controller from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupController extends Controller {
  // =attributes

  /**
   * A managed group breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
