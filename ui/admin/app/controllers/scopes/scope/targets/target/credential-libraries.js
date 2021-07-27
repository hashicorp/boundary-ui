import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsTargetCredentialLibrariesController extends Controller {
  // =services

  @service intl;

  // =attributes

  /**
   * Translated credential library breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.credential-library.title_plural');
  }
}
