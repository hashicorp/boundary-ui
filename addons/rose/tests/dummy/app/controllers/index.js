/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

const possibleItems = [
  { id: 1, name: 'foo' },
  { id: 2, name: 'bar' },
  { id: 3, name: 'baz' },
];

export default class IndexController extends Controller {
  // =attributes

  @tracked items = [...possibleItems];
  @tracked selectedItems = [possibleItems[2]];

  now = new Date();

  // =actions

  @action
  checkboxGroupChanged(selected) {
    this.selectedItems = [...selected];
  }

  @action
  clearSelected() {
    this.selectedItems = [];
  }
}
