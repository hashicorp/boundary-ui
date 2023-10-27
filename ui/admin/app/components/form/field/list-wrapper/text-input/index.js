/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

export default class MappingListTextInputComponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionValue = '';

  // =actions

  /**
   * If a new input is entered and an addRow method was specified,
   * calls addRow with the new input.  Resets previous value.
   */

  @action
  addOption() {
    assert(
      '[boundary-admin-list-wrapper] `@addOption` is required.',
      this.args.addOption
    );

    if (this.newOptionValue) {
      this.args.addOption({
        value: this.newOptionValue,
      });
    }

    this.newOptionValue = '';
  }
}
