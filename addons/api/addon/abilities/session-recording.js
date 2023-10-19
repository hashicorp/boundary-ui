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
    const readAbility = !this.model.isUnknown && super.canRead;
    if (this.resource_id) {
      return (
        readAbility &&
        ('global' === this.collection_id ||
          this.resource_id === this.collection_id)
      );
    }
    return readAbility;
  }

  get canDownload() {
    return this.hasAuthorizedAction('download');
  }
}
