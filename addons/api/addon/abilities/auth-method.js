/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';
/**
 * Provides abilities for auth method.
 */
export default class AuthMethodAbility extends ModelAbility {
  // =permissions

  /**
   * Only "known" auth method types may be read.
   * @type {boolean}
   */
  get canRead() {
    return !this.model.isUnknown && this.hasAuthorizedAction('read');
  }
}
