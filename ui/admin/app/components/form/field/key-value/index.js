/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FormFieldKeyValueComponent extends Component {
  /**
   * Determines if the delete button should be shown.
   */
  get canDelete() {
    const rows = this.args.data || [];

    // If there are no rows, do not show the delete button
    if (rows.length === 0) {
      return false;
    }

    // If there are multiple rows, always show the delete button
    if (rows.length > 1) {
      return true;
    }

    // In case of a single row, show the delete button only if it has data
    return Object.values(rows[0]).some(
      (value) => value != null && value !== '',
    );
  }

  // =actions
  @action
  updateRow(rowData, property, { target: { value } }) {
    this.args.onUpdate?.(rowData, property, value);
  }
}
