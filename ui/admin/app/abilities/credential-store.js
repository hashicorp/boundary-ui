/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import CredentialStoreAbility from 'api/abilities/credential-store';
import { inject as service } from '@ember/service';
/**
 * Provides abilities for credential store.
 */
export default class OverrideCredentialStoreAbility extends CredentialStoreAbility {
  // =services

  @service features;

  // =permissions

  /**
   * Only "known" credential store types may be read.
   * @type {boolean}
   */
  get canRead() {
    return this.features.isEnabled('static-credentials') || !this.model.isStatic
      ? super.canRead
      : false;
  }
}
