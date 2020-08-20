import Controller from '@ember/controller';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostsHostController extends Controller {

  // =attributes

  /**
   * Host breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }

}
