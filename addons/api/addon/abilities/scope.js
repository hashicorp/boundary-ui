/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ModelAbility from './model';

/**
 * Provides abilities for scopes.
 */
export default class ScopeAbility extends ModelAbility {
  // =permissions
  /**
   * Permission that checks whether a policy can be attached to a scope
   * @type {boolean}
   */
  get canAttachStoragePolicy() {
    return this.hasAuthorizedAction('attach-storage-policy');
  }

  /**
   * Permission that checks whether a policy can be detached to a scope
   * @type {boolean}
   */
  get canDetachStoragePolicy() {
    return this.hasAuthorizedAction('detach-storage-policy');
  }

  /**
   * Setting the alias target suffix is allowed on project scopes when the
   * `set-alias-target-suffix` authorized action is present.
   * @type {boolean}
   */
  get canSetAliasSuffix() {
    return (
      this.model?.isProject &&
      this.hasAuthorizedAction('set-alias-target-suffix')
    );
  }

  /**
   * Reading the alias target suffix is allowed on project scopes
   * when the `get-alias-target-suffix` authorized action is present.
   * @type {boolean}
   */
  get canGetAliasSuffix() {
    return (
      this.model?.isProject &&
      this.hasAuthorizedAction('get-alias-target-suffix')
    );
  }

  /**
   * Removing the alias target suffix is allowed on project scopes when the
   * `remove-alias-target-suffix` authorized action is present and a suffix
   * is currently set.
   * @type {boolean}
   */
  get canRemoveAliasSuffix() {
    return (
      this.model?.isProject &&
      Boolean(this.model?.alias_suffix) &&
      this.hasAuthorizedAction('remove-alias-target-suffix')
    );
  }

  /**
   * Creating a project-scoped alias is allowed when the scope is a project
   * with a configured suffix and the user has the `create` collection action
   * on aliases.
   * @type {boolean}
   */
  get canCreateProjectAlias() {
    return (
      this.model?.isProject &&
      this.model?.hasSuffix &&
      this.model?.authorized_collection_actions?.aliases?.includes('create')
    );
  }
}
