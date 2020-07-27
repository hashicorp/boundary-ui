import Controller from '@ember/controller';

export default class ScopesScopeGroupsGroupController extends Controller {
  // =attributes

  /**
   * A group breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.id;
  }
}
