/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

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

  // =actions

  /**
   * If a new key value is entered and an addOption method was specified,
   * calls addOption with the new key and value.  Resets key and value.
   */
  @action
  addOption() {
    assert(
      '[boundary-admin-key-value-list-field] `@addOption` is required.',
      this.args.addOption
    );

    if (this.newOptionKey) {
      this.args.addOption({
        key: this.newOptionKey,
        value: this.newOptionValue,
      });
    }

    this.newOptionKey = '';
    this.newOptionValue = '';
  }
}
