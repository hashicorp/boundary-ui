import Controller from '@ember/controller';

export default class ScopesScopeHostCatalogsHostCatalogHostsHostController extends Controller {
  // =attributes

  /**
   * A role breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
