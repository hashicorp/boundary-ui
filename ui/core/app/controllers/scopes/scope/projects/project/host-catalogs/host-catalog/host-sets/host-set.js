import Controller from '@ember/controller';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostSetsHostSetController extends Controller {
  // =attributes

  /**
   * Host set breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
