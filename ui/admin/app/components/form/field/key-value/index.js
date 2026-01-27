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

    // Always show delete for multiple rows
    if (rows.length > 1) {
      return true;
    }

    // For a single row, only show if it has any non-empty values
    if (rows.length === 1) {
      return Object.values(rows[0]).some((value) => value);
    }

    // Return false if there are no rows
    return false;
  }

  // =actions
  @action
  updateRow(rowData, property, { target: { value } }) {
    this.args.onUpdate?.(rowData, property, value);
  }
}
