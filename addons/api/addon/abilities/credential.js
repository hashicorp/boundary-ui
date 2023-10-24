/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';
/**
 * Provides abilities for credential.
 */
export default class CredentialAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" credential types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }
}
