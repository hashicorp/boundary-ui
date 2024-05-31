/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedHostCatalogModel from '../generated/models/host-catalog';

export const TYPE_HOST_CATALOG_STATIC = 'static';
export const TYPE_HOST_CATALOG_DYNAMIC = 'plugin';
export const TYPES_HOST_CATALOG = Object.freeze([
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_DYNAMIC,
]);

export const TYPE_HOST_CATALOG_PLUGIN_AWS = 'aws';
export const TYPE_HOST_CATALOG_PLUGIN_AZURE = 'azure';
export const TYPES_HOST_CATALOG_PLUGIN = [
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
];

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  // =attributes

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
    return this.compositeType === 'aws';
  }

  /**
   * True if host catalog plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === 'azure';
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
