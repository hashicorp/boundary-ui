/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class WorkerFilterGeneratorIndexComponent extends Component {
  // =attributes

  generatorTagType = 'tag';
  generatorNameType = 'name';
  operatorOptions = ['==', 'matches', 'contains'];
  @tracked showFilterGenerator = this.defaultShowFilterGenerator;
  @tracked selectedGeneratorType = this.generatorTagType;
  @tracked key = '';
  @tracked value = '';
  @tracked operator = '';

  /**
   * @type {string}
   */
  get defaultShowFilterGenerator() {
    return this.args.showFilterGenerator;
  }

  /**
   * @return {string}
   */
  get generatedResult() {
    let valueResult = this.value ? `"${this.value}"` : '';
    if (this.selectedGeneratorType === 'tag') {
      let keyResult = this.key ? `"/tags/${this.key}"` : '';
      return keyResult || valueResult ? `${valueResult} in ${keyResult}` : '';
    } else {
      return valueResult || this.operator
        ? `"/name" ${this.operator} ${valueResult}`
        : '';
    }
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

  /**
   * Clears out key, value, and operator.
   * Sets selectedGeneratorType to a value.
   * @param {object} event
   */
  @action
  setGeneratorType(event) {
    this.key = '';
    this.value = '';
    this.operator = '';
    this.selectedGeneratorType = event.target.value;
  }
}
