/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import ScopeAbility from 'api/abilities/scope';
import { service } from '@ember/service';

export default class OverrideScopeAbility extends ScopeAbility {
  // =services

  @service features;

  // =attributes

  /**
   * Navigating to a resource is allowed if either list or create grants
   * are present.
   * @type {boolean}
   */
  get canNavigate() {
    return this.canList || this.canCreate;
  }

  /**
   * Creating a resource is allowed only if a create grant is present
   * and collection-specific criteria are met.
   * @type {boolean}
   */
  get canCreate() {
    switch (this.collection) {
      case 'storage-buckets':
      case 'policies':
        return (
          this.features.isEnabled('ssh-session-recording') && super.canCreate
        );
      default:
        return super.canCreate;
    }
  }

  /**
   * Listing a resource is allowed only if a list grant is present
   * and collection-specific criteria are met.
   * @type {boolean}
   */
  get canList() {
    switch (this.collection) {
      case 'session-recordings':
      case 'storage-buckets':
      case 'policies':
        return (
          this.features.isEnabled('ssh-session-recording') && super.canList
        );
      default:
        return super.canList;
    }
  }

  /**
   * Attaching a policy is allowed only if the feature flag is enabled
   * @type {boolean}
   */
  get canAttachStoragePolicy() {
    return this.features.isEnabled('ssh-session-recording')
      ? this.hasAuthorizedAction('attach-storage-policy')
      : false;
  }

  /**
   * Deattaching a policy is allowed only if the feature flag is enabled
   * @type {boolean}
   */
  get canDetachStoragePolicy() {
    return this.features.isEnabled('ssh-session-recording')
      ? this.hasAuthorizedAction('detach-storage-policy')
      : false;
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
      this.model?.isProject && !this.model?.hasSuffix && this.canSetAliasSuffix
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
      org &&
      !org.hasSuffix &&
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
