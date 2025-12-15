/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedHostCatalogModel from '../generated/models/host-catalog';
import { tracked } from '@glimmer/tracking';

export const TYPE_HOST_CATALOG_STATIC = 'static';
export const TYPE_HOST_CATALOG_DYNAMIC = 'plugin';
export const TYPES_HOST_CATALOG = Object.freeze([
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_DYNAMIC,
]);

export const TYPE_HOST_CATALOG_PLUGIN_AWS = 'aws';
export const TYPE_HOST_CATALOG_PLUGIN_AZURE = 'azure';
export const TYPE_HOST_CATALOG_PLUGIN_GCP = 'gcp';
export const TYPES_HOST_CATALOG_PLUGIN = [
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
];

export const TYPE_CREDENTIAL_STATIC = 'static-credential';
export const TYPE_CREDENTIAL_DYNAMIC = 'dynamic-credential';

export const TYPES_CREDENTIALS = Object.freeze([
  TYPE_CREDENTIAL_STATIC,
  TYPE_CREDENTIAL_DYNAMIC,
]);

export const DYNAMIC_CREDENTIAL_FIELDS = [
  'role_arn',
  'role_external_id',
  'role_session_name',
  'role_tags',
];
export const STATIC_CREDENTIAL_FIELDS = ['access_key_id, secret_access_key'];

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  // =attributes

  @tracked _credentialTypeValue;

  /**
   * True if the host catalog is static.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

  /**
   * True if the host catalog is a plugin.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * Gets a value from credentialType
   * @type {string}
   */
  get credentialType() {
    if (!this._credentialTypeValue) {
      if (DYNAMIC_CREDENTIAL_FIELDS.some((field) => this[field])) {
        return TYPE_CREDENTIAL_DYNAMIC;
      } else {
        return TYPE_CREDENTIAL_STATIC;
      }
    }
    return this._credentialTypeValue;
  }

  /**
   * Sets a value to credentialType
   * @type {string}
   */
  set credentialType(type) {
    this._credentialTypeValue = type;
  }

  /**
   * True if the host catalog is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return (
      this.isPlugin && !TYPES_HOST_CATALOG_PLUGIN.includes(this.plugin?.name)
    );
  }

  /**
   * True if host catalog plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === TYPE_HOST_CATALOG_PLUGIN_AWS;
  }

  /**
   * True if host catalog plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === TYPE_HOST_CATALOG_PLUGIN_AZURE;
  }

  /**
   * True if host catalog plugin type is GCP.
   * @type {boolean}
   */
  get isGCP() {
    return this.compositeType === TYPE_HOST_CATALOG_PLUGIN_GCP;
  }

  /**
   * If host catalog is a plugin return `plugin.name`,
   * otherwise return the host catalog type.
   * @type {string}
   */
  get compositeType() {
    if (this.isUnknown) return 'unknown';
    if (this.isPlugin) return this.plugin.name;
    return 'static';
  }

  /**
   * Sets `type`.  If type is different than `static`, sets `type` to `plugin`
   * and `plugin.name` to the specified type.
   */
  set compositeType(type) {
    if (type === 'static') {
      this.type = 'static';
    } else {
      this.type = 'plugin';
      this.plugin = { name: type };
    }
  }
}
