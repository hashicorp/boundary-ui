import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeRolesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.role.title_plural');
  }
}
