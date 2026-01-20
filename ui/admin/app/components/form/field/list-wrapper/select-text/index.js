/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
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
   * Determines if we need to show an empty row to the users to enter more key/value pairs based on removeDuplicates arg,
   * by default it is true
   * @type {object}
   */
  get showNewRow() {
    if (this.args.removeDuplicates) {
      return (
        Object.keys(this.options || {}).length !==
        Object.keys(this.args.selectOptions || {}).length
      );
    } else {
      return true;
    }
  }

  /**
   * Prevents users from selecting duplicate keys from the select list if there's the arg is set to true
   * @type {object}
   */
  get selectOptions() {
    const previouslySelectedKeys = Object.keys(this.options || {});
    if (this.args.removeDuplicates && previouslySelectedKeys.length) {
      const newObj = { ...this.args.selectOptions };
      for (const key of Object.keys(newObj)) {
        if (previouslySelectedKeys.includes(key)) {
          delete newObj[key];
        }
      }
      return newObj;
    } else {
      return this.args.selectOptions;
    }
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
    const newObj = { ...this.args.model[field], [newKey]: oldVal };
    delete newObj[oldkey];
    set(this.args.model, field, newObj);
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
      this.args.model[field] = {
        ...this.args.model[field],
        [this.newOptionKey]: this.newOptionValue,
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
      const newObj = { ...this.args.model[field] };
      delete newObj[selectedKey];
      set(this.args.model, field, newObj);
    }
  }
}
