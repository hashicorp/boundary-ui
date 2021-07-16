import Controller from '@ember/controller';

export default class ScopesScopeCredentialStoresCredentialStoreController extends Controller {
  // =attributes

  /**
   * A credential store breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
