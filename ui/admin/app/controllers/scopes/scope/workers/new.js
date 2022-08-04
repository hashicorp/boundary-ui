import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated new worker breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('titles.new');
  }
}
