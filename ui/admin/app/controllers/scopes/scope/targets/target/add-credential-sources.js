import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetAddCredentialSourcesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Checks for unassigned credential sources.
   * @type {boolean}
   */
  get hasAvailableCredentialSources() {
    return this.model.filteredCredentialSources.length > 0;
  }

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.actions.add-credential-sources');
  }
}
