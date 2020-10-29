import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.host-catalog.title_plural');
  }
}
