/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import oidc from './oidc';
import ldap from './ldap';
import password from './password';

const modelTypeToComponent = {
  ldap,
  password,
  oidc,
};

export default class FormAuthMethodIndex extends Component {
  get authMethodFormComponent() {
    const component = modelTypeToComponent[this.args.model.type];
    assert(
      `Mapped component must exist for auth method: ${this.args.model.type}`,
      component,
    );
    return component;
  }

  /**
   * Adds a new empty row to the specified field
   * @param {string} field - The field name to add a row to
   * @param {function} emptyRow - Function that returns an empty row object
   */
  @action
  addRow(field, emptyRow) {
    this.args.model[field] = [...this.args.model[field], emptyRow()];
  }

  /**
   * Removes a row from the specified field
   * @param {string} field - The field name to remove a row from
   * @param {function} emptyRow - Function that returns an empty row object (to ensure at least one row exists)
   * @param {object} rowData - The row data to remove
   */
  @action
  removeRow(field, emptyRow, rowData) {
    let rows = this.args.model[field].filter((item) => item !== rowData);
    // Ensure at least one empty row exists for editing
    if (rows.length === 0) {
      rows = [emptyRow()];
    }
    this.args.model[field] = rows;
  }

  /**
   * Updates a specific property in a row
   * @param {string} field - The field name containing the row
   * @param {object} rowData - The row object to update
   * @param {string} property - The property name to update
   * @param {object} event - The DOM event containing the new value
   */
  @action
  updateRow(field, rowData, property, { target: { value } }) {
    rowData[property] = value;
    this.args.model[field] = [...this.args.model[field]];
  }
}
