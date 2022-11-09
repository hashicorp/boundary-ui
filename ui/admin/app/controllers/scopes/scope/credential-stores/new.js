import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresNewController extends Controller {
  // =services

  @service intl;

  // =attributes
  queryParams = ['type'];
  /**
   * Breadcrumb for new route
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.credential-store.titles.new');
  }
}
