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

    // If there is no data, do not show the delete button
    // NOTE: The UI always includes at least one placeholder row.
    // The placeholder row [{key: '', value: ''}] is filtered out in the controller before sending data to the API, as the API requires an empty array when no data is present.
    if (rows.length === 0) {
      return false;
    }

    // If there are multiple rows, always show the delete button
    if (rows.length > 1) {
      return true;
    }

    // In case of a single row, show the delete button only if it has data
    return Object.values(rows[0]).some((value) => value);
  }

  // =actions
  @action
  updateRow(rowData, property, { target: { value } }) {
    this.args.onUpdate?.(rowData, property, value);
  }
}
