import Controller from '@ember/controller';

export default class ScopesScopeTargetsTargetController extends Controller {
  // =attributes

  /**
   * An user breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
