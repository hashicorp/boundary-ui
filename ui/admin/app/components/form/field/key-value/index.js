/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';

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
      const row = rows[0];
      for (const key in row) {
        if (row[key]) return true;
      }
      return false;
    }

    // Return false if there are no rows
    return false;
  }
}
