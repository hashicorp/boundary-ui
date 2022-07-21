import Controller from '@ember/controller';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsCredentialController extends Controller {
  // =attributes

  /**
   * A model breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
