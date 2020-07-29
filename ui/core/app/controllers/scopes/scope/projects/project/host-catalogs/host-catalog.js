import Controller from '@ember/controller';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogController extends Controller {

  // =attributes

  /**
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }

}
