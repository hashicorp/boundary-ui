/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action, set } from '@ember/object';
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

  /**
   * Adds a key/value option object. We recreate a new array after adding
   * so that ember is aware that the array has been modified.
   * @param field {string}
   * @param key {string}
   * @param value {string}
   */
  @action
  addOption(field, { key, value }) {
    const existingArray = this.args.model[field] ?? [];
    const newArray = [...existingArray, { key, value }];
    set(this.args.model, field, newArray);
  }

  /**
   * Removes an option by index. We recreate a new array after
   * splicing out the item so that ember is aware that the array has been modified.
   * @param field {string}
   * @param index {number}
   */
  @action
  removeOptionByIndex(field, index) {
    const newArray = this.args.model[field].filter((_, i) => i !== index);
    set(this.args.model, field, newArray);
  }
}
