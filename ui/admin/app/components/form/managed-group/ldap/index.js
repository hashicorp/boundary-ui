/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class FormManagedGroupLdapComponent extends Component {
  // =attributes
  /**
   * @type {string}
   */
  @tracked newGroup = '';

  @action
  addGroupName() {
    if (this.newGroup) {
      this.args.addStringItem('group_names', this.newGroup);
    }
    this.newGroup = '';
  }
}
