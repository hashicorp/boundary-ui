import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeGroupsNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated new group breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('titles.new');
  }
}
