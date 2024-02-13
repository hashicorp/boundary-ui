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

  /**
   * Only "known" session recording types may be deleted.
   * @type {boolean}
   */
  get canDelete() {
    return !this.model.isUnknown && super.canDelete && this.model.isAvailable;
  }

  get canDownload() {
    return this.hasAuthorizedAction('download');
  }

  /* Permission that checks whether a policy can be reapplied to a session recording
   * @type {boolean}
   */
  get canReapplyStoragePolicy() {
    return this.hasAuthorizedAction('reapply-storage-policy');
  }
}
