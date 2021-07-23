import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialLibrariesNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated new credential libraries breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('titles.new');
  }
}
