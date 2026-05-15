/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { assert } from '@ember/debug';
import {
  TYPES_HOST_CATALOG,
  TYPES_HOST_CATALOG_PLUGIN,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
  TYPE_HOST_CATALOG_STATIC,
} from 'api/models/host-catalog';
import awsHostCatalogFormComponent from './aws';
import azureHostCatalogFormComponent from './azure';
import gcpHostCatalogFormComponent from './gcp';
import staticHostCatalogFormComponent from './static';

const modelCompositeTypeToComponent = {
  [TYPE_HOST_CATALOG_PLUGIN_AWS]: awsHostCatalogFormComponent,
  [TYPE_HOST_CATALOG_PLUGIN_AZURE]: azureHostCatalogFormComponent,
  [TYPE_HOST_CATALOG_PLUGIN_GCP]: gcpHostCatalogFormComponent,
  [TYPE_HOST_CATALOG_STATIC]: staticHostCatalogFormComponent,
};

const icons = ['aws-color', 'azure-color', 'gcp-color'];

export default class FormHostCatalogIndexComponent extends Component {
  // =properties
  hostCatalogTypes = TYPES_HOST_CATALOG;
  /**
   * maps resource type with icon
   * @type {object}
   */
  get mapResourceTypeWithIcon() {
    return TYPES_HOST_CATALOG_PLUGIN.reduce(
      (obj, plugin, i) => ({ ...obj, [plugin]: icons[i] }),
      {},
    );
  }

  /**
   * Returns the host catalog form component associated with the model's composite type
   * @type {Component}
   */
  get hostCatalogFormComponent() {
    const component =
      modelCompositeTypeToComponent[this.args.model.compositeType];
    assert(
      `Mapped component must exist for host catalog composite type: ${this.args.model.compositeType}`,
      component,
    );
    return component;
  }

  // =actions

  @action
  toggleDisableCredentialRotation(model) {
    model.disable_credential_rotation = !model.disable_credential_rotation;
  }

  /**
   * Adds a new empty row to the specified field
   * @param {string} field - The field name to add a row to
   * @param {Array<string>} properties - Array of property names for the empty row (e.g., ['value'] or ['key', 'value'])
   */
  @action
  addRow(field, properties) {
    const emptyRow = Object.fromEntries(properties.map((prop) => [prop, '']));
    this.args.model[field] = [...(this.args.model[field] ?? []), emptyRow];
  }

  /**
   * Removes a row from the specified field
   * @param {string} field - The field name to remove a row from
   * @param {object} rowData - The row data to remove
   */
  @action
  removeRow(field, rowData) {
    let rows = (this.args.model[field] ?? []).filter(
      (item) => item !== rowData,
    );

    if (rows.length === 0) {
      const properties = Object.keys(rowData).length
        ? Object.keys(rowData)
        : ['value'];
      rows = [Object.fromEntries(properties.map((prop) => [prop, '']))];
    }

    this.args.model[field] = rows;
  }

  /**
   * @param {string} field - The field name containing the row
   * @param {object} rowData - The row object to update
   * @param {string} property - The property name to update
   * @param {object} event - The DOM event containing the new value
   */
  @action
  updateRow(field, rowData, property, { target: { value } }) {
    rowData[property] = value;
    this.args.model[field] = [...(this.args.model[field] ?? [])];
  }
}
