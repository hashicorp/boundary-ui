import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeHostCatalogsHostCatalogHostSetsHostSetCreateAndAddHostController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.host-set.actions.create-and-add-host');
  }
}
