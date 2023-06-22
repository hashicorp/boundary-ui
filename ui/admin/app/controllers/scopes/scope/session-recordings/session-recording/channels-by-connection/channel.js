/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { reverseIndexedDisplayName } from 'core/helpers/reverse-indexed-display-name';

export default class ScopesScopeSessionRecordingsSessionRecordingChannelsByConnectionChannelController extends Controller {
  // =services

  @service intl;

  /**
   * Session recording channel breadcrumb
   */
  get breadCrumb() {
    return reverseIndexedDisplayName(
      this.intl,
      'resources.session-recording.channel.title_index',
      this.model.channelRecording.connection_recording.channel_recordings,
      this.model.channelRecording
    );
  }
}
