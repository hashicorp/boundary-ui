/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class MappingListComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionKey = '';

  /**
   * @type {string}
   */
  @tracked newOptionValue = '';

  /**
   * Returns an object of key/value pair that the user enters
   * @type {object}
   */
  get options() {
    return this.args?.options || this.args?.model?.[this.args.name];
  }

  /**
   * Determines if we need to show an empty row to the users to enter more key/value pairs
   * @type {object}
   */
  get showNewRow() {
    return (
      Object.keys(this.options || {}).length !==
      Object.keys(this.args.selectOptions || {}).length
    );
  }
  // =actions

  /**
   * Handles when then user makes changes to the select list
   * @param oldkey {string}
   * @param oldVal {string}
   */
  @action
  selectChange(oldkey, oldVal, { target: { value: newKey } }) {
    const field = this.args.name;
    delete this.args.model[field][oldkey];
    this.args.model[field] = {
      ...this.args.model[field],
      [newKey]: oldVal,
    };
  }

  /**
   * Handles input changes
   * @param key {string}
   */
  @action
  updateInput(key, { target: { value: newValue } }) {
    const field = this.args.name;
    this.args.model[field] = {
      ...this.args.model[field],
      [key]: newValue,
    };
  }

  /**
   * If a new key value is entered and an addOption method was specified,
   * calls addOption with the new key and value. Resets key and value.
   * Otherwise use the model argument to create the array and update the model
   */

  @action
  addOption() {
    if (this.args.addOption) {
      if (this.newOptionKey) {
        this.args.addOption({
          key: this.newOptionKey,
          value: this.newOptionValue,
        });
      }
    } else {
      const field = this.args.name;
      const newRow = {};
      newRow[this.newOptionKey] = this.newOptionValue;
      this.args.model[field] = {
        ...this.args.model[field],
        ...newRow,
      };
    }

    this.newOptionKey = '';
    this.newOptionValue = '';
  }

  /**
   * If removeOptionByIndex method was passed, use that.
   * Otherwise, use the model to remove an option by key
   * @param index {number}
   */
  @action
  removeOptionByKey(selectedKey) {
    if (this.args.removeOptionByKey) {
      this.args.removeOptionByKey(selectedKey);
    } else {
      const field = this.args.name;

      const newObj = Object.keys(this.args.model[field] || {}).reduce(
        (obj, key) => {
          key !== selectedKey && (obj[key] = this.args.model[field][key]);
          return obj;
        },
        {},
      );
      set(this.args.model, field, newObj);
    }
  }
}
