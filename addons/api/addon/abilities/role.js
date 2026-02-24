/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';
import { service } from '@ember/service';

class InvalidRolePrincipalTypeError extends Error {
  name = 'InvalidRolePrincipalTypeError';
}

/**
 * Provides abilities for roles.
 */
export default class RoleAbility extends ModelAbility {
  // =services

  @service can;

  // =permissions

  /**
   * @type {boolean}
   */
  get canSetGrants() {
    return this.hasAuthorizedAction('set-grants');
  }

  /**
   * @type {boolean}
   */
  get canSetGrantScopes() {
    return this.hasAuthorizedAction('set-grant-scopes');
  }

  /**
   * @type {boolean}
   */
  get canAddPrincipals() {
    return this.hasAuthorizedAction('add-principals');
  }

  /**
   * @type {boolean}
   */
  get canRemovePrincipals() {
    return this.hasAuthorizedAction('remove-principals');
  }

  /**
   * Returns the ability check for a principal model instance.
   * Valid role principal models are: User, Group, and ManagedGroup.
   * Throws an error if the principal type is invalid.
   * @type {boolean}
   * @throws {InvalidRolePrincipalTypeError}
   */
  get canReadPrincipal() {
    const type = this.model.constructor.modelName;
    const typeIsValid =
      type === 'user' || type === 'group' || type === 'managed-group';
    if (!typeIsValid) {
      throw new InvalidRolePrincipalTypeError(
        `Expected a role principal of type 'user', 'group', or 'managed-group'.  Got '${type}'.`,
      );
    }
    return this.can.can(`read ${type}`, this.model);
  }
}
