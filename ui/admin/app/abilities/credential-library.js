/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import CredentialLibraryAbility from 'api/abilities/credential-library';
import { inject as service } from '@ember/service';

export default class OverrideCredentialLibraryAbility extends CredentialLibraryAbility {
  // =service
  @service features;

  /**
   * This override ensures that vault ssh cert may be read only if the
   * ssh-target feature flag is enabled.
   * All other types are subject to the standard logic found in the api addon.
   */
  get canRead() {
    return this.features.isEnabled('ssh-target') ||
      !this.model.isVaultSSHCertificate
      ? super.canRead
      : false;
  }
}
