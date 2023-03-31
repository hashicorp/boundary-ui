/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';
import { inject as service } from '@ember/service';

/**
 * Provides abilities for channel recordings.
 */
export default class ChannelRecordingAbility extends ModelAbility {
  // =services
  @service abilities;

  // =permissions
  get canDownloadAsciicast() {
    const sessionRecording = this.model.connection_recording.session_recording;
    const sessionRecordingAbility = this.abilities.abilityFor(
      'session-recording',
      sessionRecording
    );

    return this.model.isAsciicast && sessionRecordingAbility.canDownload;
  }
}
