import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsProjectTargetsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Targets breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.targets');
  }
}
