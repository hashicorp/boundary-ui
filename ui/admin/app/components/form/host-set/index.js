/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class FormHostSetIndexComponent extends Component {
  // =attributes

  // =actions

  /**
   * Adds a key/value option object. We recreate a new array after adding
   * so that ember is aware that the array has been modified.
   * @param field {string}
   * @param key {string}
   * @param value {string}
   */
  @action
  addOption(field, { key }) {
    const existingArray = this.args.model[field] ?? [];
    const newArray = [...existingArray, { key }];
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
