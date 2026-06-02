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
   * Setting the alias target suffix is allowed on project and org scopes when
   * the `set-alias-target-suffix` authorized action is present.
   * @type {boolean}
   */
  get canSetAliasSuffix() {
    return (
      (this.model?.isProject || this.model?.isOrg) &&
      this.hasAuthorizedAction('set-alias-target-suffix')
    );
  }

  /**
   * Removing the alias target suffix is allowed when the scope has a suffix
   * (`hasSuffix`) and the `remove-alias-target-suffix` authorized action is
   * present.
   * @type {boolean}
   */
  get canRemoveAliasSuffix() {
    return (
      this.model?.hasSuffix &&
      this.hasAuthorizedAction('remove-alias-target-suffix')
    );
  }

  /**
   * True when the project scope is missing an alias suffix and the user
   * has permission to set one — indicating a prompt should be shown.
   * @type {boolean}
   */
  get canSeeProjectSuffixPrompt() {
    return (
      this.model?.isProject &&
      !this.model?.alias_suffix &&
      this.canSetAliasSuffix
    );
  }

  /**
   * True when the project scope's parent org is missing an alias suffix
   * and the user has permission to set one on that org — indicating a
   * prompt should be shown.
   * @type {boolean}
   */
  get canSeeOrgSuffixPrompt() {
    const org = this.model?.scopeModel;
    return (
      this.model?.isProject &&
      !!org &&
      !org.alias_suffix &&
      org.authorized_actions?.includes('set-alias-target-suffix')
    );
  }

  /**
   * Creating a project-scoped alias is allowed when the scope is a project
   * with a configured suffix, the parent org also has a configured suffix,
   * and the user has the `create` collection action on aliases.
   * @type {boolean}
   */
  get canCreateProjectAlias() {
    return (
      this.model?.isProject &&
      this.model?.hasSuffix &&
      this.model?.scopeModel?.hasSuffix &&
      this.model?.authorized_collection_actions?.aliases?.includes('create')
    );
  }
}
