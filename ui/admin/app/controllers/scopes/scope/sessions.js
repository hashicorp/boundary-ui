import Controller from '@ember/controller';
import { inject as service } from '@ember/service';


export default class ScopesScopeSessionsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.session.title_plural');
  }
}
