import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsProjectHostCatalogsHostCatalogHostsController extends Controller {

  // =services

  @service intl;

  // =attributes

  /**
   * Hosts breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.hosts');
  }
  
}
