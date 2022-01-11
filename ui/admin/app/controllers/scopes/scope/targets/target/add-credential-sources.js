import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetAddCredentialSourcesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.actions.add-credential-sources');
  }
}
