/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedHostCatalogModel from '../generated/models/host-catalog';

export const TYPE_HOST_CATALOG_STATIC = 'static';
export const TYPE_HOST_CATALOG_PLUGIN = 'plugin';
export const types = [TYPE_HOST_CATALOG_STATIC, TYPE_HOST_CATALOG_PLUGIN];
export const TYPE_PLUGIN_AWS = 'aws';
export const TYPE_PLUGIN_AZURE = 'azure';
export const pluginTypes = [TYPE_PLUGIN_AWS, TYPE_PLUGIN_AZURE];

export default class HostCatalogModel extends GeneratedHostCatalogModel {
  // =attributes

  /**
   * True if the host catalog is static.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === TYPE_HOST_CATALOG_STATIC;
  }

  /**
   * True if the host catalog is a plugin.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === TYPE_HOST_CATALOG_PLUGIN;
  }

  /**
   * True if the host catalog is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return this.isPlugin && !pluginTypes.includes(this.plugin?.name);
  }

  /**
   * True if host catalog plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === TYPE_PLUGIN_AWS;
  }

  /**
   * True if host catalog plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === TYPE_PLUGIN_AZURE;
  }

  /**
   * If host catalog is a plugin return `plugin.name`,
   * otherwise return the host catalog type.
   * @type {string}
   */
  get compositeType() {
    if (this.isUnknown) return 'unknown';
    if (this.isPlugin) return this.plugin.name;
    return TYPE_HOST_CATALOG_STATIC;
  }

  /**
   * Sets `type`.  If type is different than `static`, sets `type` to `plugin`
   * and `plugin.name` to the specified type.
   */
  set compositeType(type) {
    if (type === TYPE_HOST_CATALOG_STATIC) {
      this.type = TYPE_HOST_CATALOG_STATIC;
    } else {
      this.type = TYPE_HOST_CATALOG_PLUGIN;
      this.plugin = { name: type };
    }
  }
}
