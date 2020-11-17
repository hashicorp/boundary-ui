import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.title_plural');
  }
}
