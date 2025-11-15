/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { TYPES_CREDENTIAL } from 'api/models/credential';

export default class FormCredentialComponent extends Component {
  // =attributes

  /**
   * Returns an array of available credential types the user can create
   * @type {object}
   */
  get credentialTypes() {
    return TYPES_CREDENTIAL;
  }
}
