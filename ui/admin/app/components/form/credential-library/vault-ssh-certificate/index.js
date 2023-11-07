/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';

import {
  options,
  TYPES_CREDENTIAL_LIBRARY,
} from 'api/models/credential-library';

export default class FormCredentialLibraryVaultSshCertComponent extends Component {
  // =properties

  /**
   * @type {object}
   */
  keyTypes = options.key_type;

  /**
   * @type {Array.<string>}
   */
  types = TYPES_CREDENTIAL_LIBRARY;

  /**
   * Boolean to determine if the key bits field should be displayed on the form
   * @returns {boolean}
   */
  get showKeyBits() {
    const keyType = this.args.model.key_type;
    return keyType === 'rsa' || keyType === 'ecdsa';
  }
}
