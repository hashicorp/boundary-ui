/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

export default class FormFieldListomponent extends Component {
  // =attributes

  /**
   * @type {string}
   */
  @tracked newOptionKey = '';

  // =actions

  /**
   * If a new key is entered and an addOption method was specified,
   * calls addOption with the new key. Resets the key
   */
  @action
  addOption() {
    assert(
      '[boundary-admin-list-field] `@addOption` is required.',
      this.args.addOption
    );

    if (this.newOptionKey) {
      this.args.addOption({
        key: this.newOptionKey,
      });
    }

    this.newOptionKey = '';
  }
}
