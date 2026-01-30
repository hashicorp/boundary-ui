/**
 * Copyright IBM Corp. 2021, 2026
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
   * Adds a new empty row to critical options
   */
  @action
  addCriticalOption() {
    this.args.model.critical_options = [
      ...this.args.model.critical_options,
      { key: '', value: '' },
    ];
  }

  /**
   * Updates critical options data
   */
  @action
  updateCriticalOptions(rowData, property, { target: { value } }) {
    rowData[property] = value;
    this.args.model.critical_options = [...this.args.model.critical_options];
  }

  /**
   * Removes a row from critical options
   * @param {Object} rowData - The row to remove
   */
  @action
  removeCriticalOption(rowData) {
    let rows = this.args.model.critical_options.filter(
      (item) => item !== rowData,
    );

    // Ensure at least one empty row exists for editing
    if (rows.length === 0) {
      rows = [{ key: '', value: '' }];
    }
    this.args.model.critical_options = rows;
  }
}
