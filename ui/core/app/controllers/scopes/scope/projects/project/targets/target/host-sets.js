import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsProjectTargetsTargetHostSetsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Host sets breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.host-sets');
  }
}
