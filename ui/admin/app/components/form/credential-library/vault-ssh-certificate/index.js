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
   * Default empty row for critical options
   * Kept as a field to avoid creating a new object on every re-render
   */
  defaultCriticalOptions = [{ key: '', value: '' }];

  /**
   * Boolean to determine if the key bits field should be displayed on the form
   * @returns {boolean}
   */
  get showKeyBits() {
    const keyType = this.args.model.key_type;
    return keyType === 'rsa' || keyType === 'ecdsa';
  }

  /**
   * Returns critical_options data, defaulting to an empty row if not present
   */
  get criticalOptionsData() {
    const data = this.args.model.critical_options;
    return data ?? this.defaultCriticalOptions;
  }

  /**
   * Adds a new empty row to critical options
   */
  @action
  addCriticalOption() {
    this.args.model.critical_options = [
      ...this.criticalOptionsData,
      { key: '', value: '' },
    ];
  }

  /**
   * Updates critical options data
   */
  @action
  updateCriticalOptions(rowData, property, value) {
    rowData[property] = value;
    this.args.model.critical_options = [...this.criticalOptionsData];
  }

  /**
   * Removes a row from critical options
   * @param {Object} rowData - The row to remove
   */
  @action
  removeCriticalOption(rowData) {
    let newData = this.criticalOptionsData.filter((item) => item !== rowData);
    // Ensure at least one empty row remains in the UI
    if (newData.length === 0) {
      newData = [{ key: '', value: '' }];
    }
    this.args.model.critical_options = newData;
  }
}
