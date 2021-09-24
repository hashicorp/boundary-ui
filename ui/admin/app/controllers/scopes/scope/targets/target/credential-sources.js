import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetCredentialSourcesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated credential library breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.credential-source.title_plural');
  }
}
