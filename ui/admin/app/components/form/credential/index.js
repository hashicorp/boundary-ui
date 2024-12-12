/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { TYPES_CREDENTIAL } from 'api/models/credential';

export default class FormCredentialComponent extends Component {
  // =services
  @service features;

  // =attributes
  /**
   * Returns an array of available credential types the user can create
   * @type {object}
   */
  get credentialTypes() {
    return this.features.isEnabled('json-credentials')
      ? TYPES_CREDENTIAL
      : TYPES_CREDENTIAL.filter((type) => type !== 'json');
  }
}
