import Controller from '@ember/controller';

export default class ScopesScopeUsersUserController extends Controller {
  // =attributes

  /**
   * An user breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.id;
  }
}
