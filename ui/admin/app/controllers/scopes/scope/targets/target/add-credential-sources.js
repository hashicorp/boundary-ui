import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetAddCredentialSourcesController extends Controller {
  // =services

  @service intl;

  // =attributes

  get hasAvailableCredentialSources() {
    return (
      this.model.credentialLibraries.length > 0 ||
      this.model.credentials.length > 0
    );
  }

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.actions.add-credential-sources');
  }
}
