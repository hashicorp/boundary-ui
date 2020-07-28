import Controller from '@ember/controller';

export default class ScopesScopeProjectsProjectController extends Controller {

  // =attributes

  /**
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }

}
