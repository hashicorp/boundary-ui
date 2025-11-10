/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import {
  TYPES_CREDENTIAL_LIBRARY,
  TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
} from 'api/models/credential-library';
import { service } from '@ember/service';

export default class FormCredentialLibraryRadioComponent extends Component {
  // =services
  @service features;

  /**
   * Returns credential types, filtering out SSH if the feature is disabled.
   * @returns {Array.<string>}
   */
  get credentialTypes() {
    let types = [...TYPES_CREDENTIAL_LIBRARY];

    return this.features.isEnabled('ssh-target')
      ? types
      : types.filter(
          (type) => type !== TYPE_CREDENTIAL_LIBRARY_VAULT_SSH_CERTIFICATE,
        );
  }
}
