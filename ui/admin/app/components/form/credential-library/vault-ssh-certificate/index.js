/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

import { action } from '@ember/object';
import { options } from 'api/models/credential-library';

export default class FormCredentialLibraryVaultSshCertComponent extends Component {
  // =properties

  /**
   * @type {object}
   */
  keyTypes = options.key_type;

  /**
   * Boolean to determine if the key bits field should be displayed on the form
   * @returns {boolean}
   */
  get showKeyBits() {
    const keyType = this.args.model.key_type;
    return keyType === 'rsa' || keyType === 'ecdsa';
  }

  /**
   * Updates the critical options on the credential library model with new data
   * @param {Array} newData - Array of critical option objects
   */
  @action
  updateCriticalOptions(newData) {
    this.args.model.critical_options = newData;
  }
}
