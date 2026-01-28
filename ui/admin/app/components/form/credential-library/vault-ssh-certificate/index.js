/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

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
}
