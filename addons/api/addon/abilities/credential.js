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
    const readAbility =
      !this.model.isUnknown && this.hasAuthorizedAction('read');
    if (this.resource_id) {
      return readAbility && this.resource_id === this.collection_id;
    }
    return readAbility;
  }
}
