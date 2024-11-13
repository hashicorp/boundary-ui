/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class WorkerFilterComponent extends Component {
  // =attributes

  generatorTagType = 'tag';
  generatorNameType = 'name';
  @tracked showFilterGenerator;
  @tracked filterGeneratorType = this.generatorTagType;
  @tracked tagKey = '';
  @tracked tagValue = '';

  /**
   * @return {string}
   */
  get generatedResult() {
    let keyValue = this.tagKey ? `"/tags/${this.tagKey}"` : '';
    let tagValue = this.tagValue ? `"${this.tagValue}"` : '';

    return keyValue || tagValue ? `${tagValue} in ${keyValue}` : '';
  }

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
