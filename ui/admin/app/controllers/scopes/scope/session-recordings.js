import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsController extends Controller {
  // =services

  @service intl;

  //= attributes
  /**
   * Translated breadcrumb
   */
  get breadCrumb() {
    return this.intl.t('resources.session-recording.title_plural');
  }
}
