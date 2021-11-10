import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated managed groups breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.managed-group.title_plural');
  }
}
