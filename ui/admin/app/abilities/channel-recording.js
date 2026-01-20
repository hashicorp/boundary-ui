/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import ChannelRecordingAbility from 'api/abilities/channel-recording';
import { service } from '@ember/service';

export default class OverrideChannelRecordingAbility extends ChannelRecordingAbility {
  // =service
  @service features;

  /**
   * returns true if session recording is completed and the channel
   * has the correct mime type
   */
  get canPlay() {
    const { session_recording } = this.model.connection_recording;
    return session_recording.isAvailable && this.model.isAsciicast;
  }

  /**
   * returns true if session recording is completed and the channel
   * is not the correct mime type
   */
  get canViewOnly() {
    const { session_recording } = this.model.connection_recording;
    return session_recording.isAvailable && !this.model.isAsciicast;
  }
}
