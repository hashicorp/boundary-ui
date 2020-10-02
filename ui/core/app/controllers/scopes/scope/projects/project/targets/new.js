import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsProjectTargetsNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated new target breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('titles.new');
  }
}
