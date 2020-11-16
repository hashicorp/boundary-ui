import Controller from '@ember/controller';

export default class ScopesScopeHostCatalogsHostCatalogController extends Controller {
  // =attributes

  /**
   * A role breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
