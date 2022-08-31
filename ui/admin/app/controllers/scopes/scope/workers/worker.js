import Controller from '@ember/controller';

export default class ScopesScopeWorkersWorkerController extends Controller {
  // =attributes

  /**
   * A worker breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
