import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeWorkersController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated users breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.worker.title_plural');
  }
}
