/**
 * Copyright IBM Corp. 2021, 2026
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

  /**
   * Default handler for adding a row.
   * Uses @model, @name, and @properties if provided, otherwise calls @onAdd.
   */
  @action
  handleAdd() {
    const { model, name, properties } = this.args;
    if (model && name && properties) {
      const emptyRow = Object.fromEntries(properties.map((prop) => [prop, '']));
      model[name] = [...(model[name] ?? []), emptyRow];
    } else {
      this.args.onAdd?.();
    }
  }

  /**
   * Default handler for removing a row.
   * Uses @model and @name if provided, otherwise calls @onRemove.
   */
  @action
  handleRemove(rowData) {
    const { model, name, properties } = this.args;
    if (model && name) {
      const rows = (model[name] ?? []).filter((item) => item !== rowData);
      // If removing the last row, add an empty row back
      if (rows.length === 0) {
        const emptyRow = Object.fromEntries(
          properties.map((prop) => [prop, '']),
        );
        model[name] = [emptyRow];
      } else {
        model[name] = rows;
      }
    } else {
      this.args.onRemove?.(rowData);
    }
  }

  /**
   * Default handler for updating a row.
   * Uses @model and @name if provided, otherwise calls @onUpdate.
   */
  @action
  handleUpdate(rowData, property, event) {
    const { model, name } = this.args;
    if (model && name) {
      const value = event?.target?.value ?? event;
      rowData[property] = value;
      model[name] = [...(model[name] ?? [])];
    } else {
      this.args.onUpdate?.(rowData, property, event);
    }
  }
}
