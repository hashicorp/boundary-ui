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
   * Only "active" or "pending" sessions may be read.
   * @type {boolean}
   */
  get canRead() {
    return (this.model.isActive || this.model.isPending) && super.canRead;
  }
}
