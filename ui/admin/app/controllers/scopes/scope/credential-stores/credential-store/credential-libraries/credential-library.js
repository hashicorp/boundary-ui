import Controller from '@ember/controller';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesCredentialLibraryController extends Controller {
  // =attributes

  /**
   * A model breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
