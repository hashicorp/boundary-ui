/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';
import { service } from '@ember/service';

/**
 * Provides abilities for app-tokens.
 */
export default class AppTokenAbility extends ModelAbility {
  // =services

  @service abilities;

  // =permissions

  /**
   * @type {boolean}
   */
  get canRead() {
    return (
      this.hasAuthorizedAction('read') || this.hasAuthorizedAction('read:self')
    );
  }

  /**
   * @type {boolean}
   */
  get canClone() {
    const canCreateAppToken = this.abilities.abilityFor(
      'model',
      this.model.scopeModel,
    );
    return this.canRead && canCreateAppToken;
  }

  /**
   * @type {boolean}
   */
  get canRevoke() {
    return (
      this.hasAuthorizedAction('revoke') ||
      this.hasAuthorizedAction('revoke:self')
    );
  }

  /**
   * @type {boolean}
   */
  get canDelete() {
    return (
      this.hasAuthorizedAction('delete') ||
      this.hasAuthorizedAction('delete:self')
    );
  }
}
