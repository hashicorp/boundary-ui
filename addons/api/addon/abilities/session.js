/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import ModelAbility from './model';

/**
 * Provides abilities for sessions.
 */
export default class SessionAbility extends ModelAbility {
  // =services

  // =permissions

  /**
   * Only available sessions may be read.
   * @type {boolean}
   */
  get canRead() {
    return (
      this.model.isAvailable &&
      (this.hasAuthorizedAction('read:self') || super.canRead)
    );
  }

  /**
   * Only available sessions may be canceled.
   * @type {boolean}
   */
  get canCancel() {
    return (
      this.model.isAvailable &&
      (this.hasAuthorizedAction('cancel:self') ||
        this.hasAuthorizedAction('cancel'))
    );
  }
}
