/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormFieldKeyValueComponent extends Component {
  // =properties

  @tracked data = this.args.data?.length ? [...this.args.data] : [{}];

  // =actions

  @action
  addNewRow() {
    this.data = [...this.data, {}];
    this.notifyChange();
  }

  @action
  removeRow(rowData) {
    this.data = this.data.filter((item) => item !== rowData);

    // Ensure at least one row exists
    if (this.data.length === 0) {
      this.data = [{}];
    }
    this.notifyChange();
  }

  /**
   * Action to update row data from input events and notify consumer
   * @param {Object} rowData - The row object to update
   * @param {string} property - The property name to update
   * @param {string} value - The new value
   */
  @action
  updateAndNotify(rowData, property, { target: { value } }) {
    rowData[property] = value;
    this.data = [...this.data];
    this.notifyChange();
  }

  /**
   * Checks if a row has any non-empty data
   * @param {Object} rowData - The row object to check
   * @returns {boolean} - True if the row has any non-empty values
   */
  @action
  hasData(rowData) {
    if (!this.data.includes(rowData)) return false;

    return Object.values(rowData).some(
      (value) => value != null && value !== '',
    );
  }

  /**
   * Notifies consumer of data changes with filtered results
   */
  notifyChange() {
    if (!this.args.onChange) return;

    // Filter out rows where the 'key' property is empty or missing
    const filteredData = this.data.filter(
      (item) => item.key != null && item.key !== '',
    );
    this.args.onChange(filteredData);
  }
}
