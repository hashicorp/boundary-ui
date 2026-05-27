/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

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
        if (row[key]) {
          return true;
        }
      }
<<<<<<< HEAD
=======

      return Object.values(row).some((value) => value);
>>>>>>> ef40f70de (test: 💍 tests)
    }

    // Return false if there are no rows
    return false;
  }

  get errors() {
    // If errors are passed directly as an argument, use those
    if (this.args.errors) {
      return this.args.errors;
    }

    const { model, name } = this.args;

    if (model && name && model.errors) {
      return model.errors[name];
    }

    return null;
  }

  /**
   * Default handler for adding a row.
   * Uses @model, @name, and @properties if provided, otherwise calls @onAdd.
   */
  @action
  handleAdd() {
    // If an onAdd handler is provided, use it
    if (this.args.onAdd) {
      return this.args.onAdd();
    }

    const { model, name, properties } = this.args;

    assert(
      'FormFieldKeyValueComponent: model, name, and properties are required if no custom onAdd handler is provided.',
      model && name && properties,
    );

    const emptyRow = Object.fromEntries(properties.map((prop) => [prop, '']));
    model[name] = [...(model[name] ?? []), emptyRow];
  }

  /**
   * Default handler for removing a row.
   * Uses @model and @name if provided, otherwise calls @onRemove.
   */
  @action
  handleRemove(rowData) {
    // If an onRemove handler is provided, use it
    if (this.args.onRemove) {
      return this.args.onRemove(rowData);
    }

    const { model, name, properties } = this.args;

    assert(
      'FormFieldKeyValueComponent: model, name, and properties are required if no custom onRemove handler is provided.',
      model && name && properties,
    );

    const rows = (model[name] ?? []).filter((item) => item !== rowData);

    // If removing the last row, add an empty row back
    if (rows.length === 0) {
      const emptyRow = Object.fromEntries(properties.map((prop) => [prop, '']));
      model[name] = [emptyRow];
    } else {
      model[name] = rows;
    }
  }

  /**
   * Default handler for updating a row.
   * Uses @model and @name if provided, otherwise calls @onUpdate.
   */
  @action
  handleUpdate(rowData, property, event) {
    // If an onUpdate handler is provided, use it
    if (this.args.onUpdate) {
      return this.args.onUpdate(rowData, property, event);
    }

    const { model, name } = this.args;

    assert(
      'FormFieldKeyValueComponent: model and name are required if no custom onUpdate handler is provided.',
      model && name,
    );

    const value = event?.target?.value ?? event;
    rowData[property] = value;
    model[name] = [...(model[name] ?? [])];
  }
}
