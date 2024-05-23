/**
 * Copyright (c) HashiCorp, Inc.
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
   * Returns an array of key/value pair that the user enters
   * @type {object}
   */

  get options() {
    return this.args?.options || this.args?.model?.[this.args.name];
  }
  // =actions

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
      const existingArray = this.args.model[field] ?? [];
      const newArray = [
        ...existingArray,
        { key: this.newOptionKey, value: this.newOptionValue },
      ];
      set(this.args.model, field, newArray);
    }

    this.newOptionKey = '';
    this.newOptionValue = '';
  }

  /**
   * If removeOptionByIndex method was passed, use that.
   * Otherwise, use the model to remove an option by index. We recreate a new array after
   * splicing out the item so that ember is aware that the array has been modified.
   * @param index {number}
   */
  @action
  removeOptionByIndex(index) {
    if (this.args.removeOptionByIndex) {
      this.args.removeOptionByIndex(index);
    } else {
      const field = this.args.name;
      const newArray = this.args.model[field].filter((_, i) => i !== index);
      set(this.args.model, field, newArray);
    }
  }
}
