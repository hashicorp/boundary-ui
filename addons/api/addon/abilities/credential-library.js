/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';
/**
 * Provides abilities for credential.
 */
export default class CredentialLibraryAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" credential library types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }
}
