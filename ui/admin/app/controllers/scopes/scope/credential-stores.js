import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeCredentialStoresController extends Controller {
  // =services

  @service intl;

  // = attributes
  /**
   * Translated breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.credential-store.title_plural');
  }
}
