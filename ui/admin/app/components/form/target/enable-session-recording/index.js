/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormEnableSessionRecordingIndexComponent extends Component {
  //actions
  /**
   * toggle to enable session recording for the target
   */
  @action
  toggleSessionRecording() {
    this.args.model.enable_session_recording =
      !this.args.model.enable_session_recording;
  }

  @action
  selectStorageBucket({ target: { value: selectedStorageBucketID } }) {
    this.args.model.storage_bucket_id = selectedStorageBucketID;
  }
}
