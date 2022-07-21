import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresCredentialStoreCredentialsController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated credential breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.credential.title_plural');
  }
}
