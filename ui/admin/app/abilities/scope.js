/**
 * Copyright IBM Corp. 2024, 2026
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
}
