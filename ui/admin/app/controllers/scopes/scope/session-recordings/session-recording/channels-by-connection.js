import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionController extends Controller {
  // =services

  @service intl;

  // =attributes
  /**
   * Translated breadcrumb
   */
  get breadCrumb() {
    return this.intl.t(
      'resources.session-recording.channels-by-connection.title'
    );
  }
}
