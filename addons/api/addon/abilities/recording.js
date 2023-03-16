/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for session recordings.
 */
export default class RecordingAbility extends ModelAbility {
  // =services

  // =permissions

  /**
   * Only "known" session recording types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }

  get canList() {
    return (
      this.hasAuthorizedCollectionAction('list') &&
      (this.model.isGlobal || this.model.isOrg)
    );
  }

  get canDownloadAsciiCast() {
    return this.model.isSSH && this.hasAuthorizedAction('download');
  }
}
