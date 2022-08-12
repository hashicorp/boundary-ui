import Controller from '@ember/controller';

export default class ScopesScopeWorkersWorkerController extends Controller {
  // =attributes

  /**
   * An worker breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
