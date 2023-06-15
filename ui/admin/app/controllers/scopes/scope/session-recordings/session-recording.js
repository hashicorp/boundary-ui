import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingController extends Controller {
  // =services

  @service intl;

  /**
   * Session recording breadcrumb
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
