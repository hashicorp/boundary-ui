/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { set } from '@ember/object';

export default class MappingListSelectComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionValue = '';

  get options() {
    return this.args.options || this.args.model[this.args.name];
  }

  /**
   * If a new input is entered and an addOption method was specified,
   * calls addOption with the new input. Resets previous value.
   * Otherwise use the model argument to create the array and update the model
   */

  @action
  addOption() {
    if (this.args.addOption && this.newOptionValue) {
      this.args.addOption({
        value: this.newOptionValue,
      });
    } else {
      const field = this.args.name;
      const existingArray = this.args.model[field] ?? [];
      const newArray = [...existingArray, { value: this.newOptionValue }];
      set(this.args.model, field, newArray);
    }

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
