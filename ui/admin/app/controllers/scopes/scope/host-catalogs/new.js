import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = ['type'];

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.host-catalog.titles.new');
  }
}
