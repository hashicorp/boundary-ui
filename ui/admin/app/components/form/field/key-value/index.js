/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class FormFieldKeyValueComponent extends Component {
  // =properties

  @tracked data = this.args.data?.length
    ? [...this.args.data]
    : [this.createEmptyRow()];

  // Determine if the value field should be shown
  get showValueField() {
    return this.args.showValueField !== false;
  }

  createEmptyRow() {
    const row = { key: '' };
    if (this.showValueField) {
      row.value = '';
    }
    return row;
  }

  // =actions

  /**
   * Updates the key value for a specific row and triggers change notification
   * @param {Object} rowData
   * @param {Event} event
   */
  @action
  updateKey(rowData, { target: { value } }) {
    this.updateRowProperty(rowData, 'key', value);
  }

  /**
   * Updates the value field for a specific row and triggers change notification
   * @param {Object} rowData
   * @param {Event} event
   */
  @action
  updateValue(rowData, { target: { value } }) {
    this.updateRowProperty(rowData, 'value', value);
  }

  @action
  addNewRow() {
    this.data = [...this.data, this.createEmptyRow()];
    this.notifyChange();
  }

  @action
  removeRow(rowData) {
    this.data = this.data.filter((item) => item !== rowData);

    // Ensure at least one row exists
    if (this.data.length === 0) {
      this.data = [this.createEmptyRow()];
    }
    this.notifyChange();
  }

  /**
   * Helper method to update a property on a row
   * @param {Object} rowData - The row object to update
   * @param {string} property - The property name to update
   * @param {string} value - The new value
   */
  updateRowProperty(rowData, property, value) {
    rowData[property] = value;
    this.data = [...this.data];
    this.notifyChange();
  }

  /**
   * Notifies parent component of data changes with filtered results
   */
  notifyChange() {
    if (this.args.onChange) {
      // Filter out entries with empty/whitespace keys
      const filteredData = this.data.filter((item) => item.key?.trim());
      this.args.onChange(filteredData);
    }
  }
}
