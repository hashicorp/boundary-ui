import Controller from '@ember/controller';

export default class ScopesScopeProjectsProjectTargetsTargetController extends Controller {

  // =attributes

  /**
   * A target breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }

}
