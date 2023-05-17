/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import OverrideModelAbility from './model';
import { inject as service } from '@ember/service';

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
        return this.features.isEnabled('session-recording') && super.canCreate;
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
        return this.features.isEnabled('session-recording') && super.canList;
      default:
        return super.canList;
    }
  }
}
