/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import OverrideModelAbility from './model';
import { service } from '@ember/service';

export default class OverrideScopeAbility extends OverrideModelAbility {
  // =services

  @service features;

  // =attributes

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
}
