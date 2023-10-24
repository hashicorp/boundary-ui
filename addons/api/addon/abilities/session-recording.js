/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for session recordings.
 */
export default class SessionRecordingAbility extends ModelAbility {
  // =services

  // =permissions

  /**
   * Only "known" session recording types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && super.canRead;
  }

  get canDownload() {
    return this.hasAuthorizedAction('download');
  }
}
