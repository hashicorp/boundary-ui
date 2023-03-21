import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelController extends Controller {
  // =services

  @service intl;

  /**
   * Session recording channel breadcrumb
   */
  get breadCrumb() {
    return this.model.channel_id;
  }
}
