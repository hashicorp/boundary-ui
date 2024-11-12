/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class WorkerFilterComponent extends Component {
  // =attributes

  @tracked showFilterGenerator;

  // =actions

  /**
   * Sets the model filter to the passed in value.
   * @param {Model} model
   * @param {string} filter
   * @param {string} value
   */
  @action
  setWorkerFilter(model, filter, value) {
    model[filter] = value;
  }

  /**
   * Toggles showFilterGenerator attribute to true or false.
   */
  @action
  toggleFilterGenerator() {
    this.showFilterGenerator = !this.showFilterGenerator;
  }
}
