/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedHostSetModel from '../generated/models/host-set';
import {
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_PLUGIN,
  TYPE_PLUGIN_AWS,
  TYPE_PLUGIN_AZURE,
  pluginTypes,
} from './host-catalog';

export default class HostSetModel extends GeneratedHostSetModel {
  // =attributes

  /**
   * Returns if the host-set is static or not.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === TYPE_HOST_CATALOG_STATIC;
  }

  /**
   * Returns if the host-set is plugin or not.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === TYPE_HOST_CATALOG_PLUGIN;
  }

  /**
   * True if the host set is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return this.isPlugin && !pluginTypes.includes(this.plugin?.name);
  }

  /**
   * Returns if a host-set plugin is AWS or not
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === TYPE_PLUGIN_AWS;
  }

  /**
   * Return if a host-set plugin is Azure or not.
   */
  get isAzure() {
    return this.compositeType === TYPE_PLUGIN_AZURE;
  }

  /**
   * If a host-set is a plugin return its name,
   * otherwise returns the host-set type
   * @type {string}
   */
  get compositeType() {
    if (this.isUnknown) return 'unknown';
    if (this.isPlugin) return this.plugin.name;
    return TYPE_HOST_CATALOG_STATIC;
  }

  /**
   * Sets type, if type is different than static, set plugin name to type
   */
  set compositeType(type) {
    if (type === TYPE_HOST_CATALOG_STATIC) {
      this.type = TYPE_HOST_CATALOG_STATIC;
    } else {
      this.type = TYPE_HOST_CATALOG_PLUGIN;
      this.plugin = { name: type };
    }
  }

  // =methods

  /**
   * Adds hosts via the `add-hosts` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  addHosts(hostIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'add-hosts',
      hostIDs,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Add a single host via the `add-hosts` method.
   * @param {string} hostID
   * @param {object} options
   * @return {Promise}
   */
  addHost(hostID, options) {
    return this.addHosts([hostID], options);
  }

  /**
   * Delete hosts via the `remove-hosts` method.
   * See serializer and adapter for more information.
   * @param {[string]} hostIDs
   * @param {object} options
   * @param {object} options.adapterOptions
   * @return {Promise}
   */
  removeHosts(hostIDs, options = { adapterOptions: {} }) {
    const defaultAdapterOptions = {
      method: 'remove-hosts',
      hostIDs,
    };
    return this.save({
      ...options,
      adapterOptions: {
        ...defaultAdapterOptions,
        ...options.adapterOptions,
      },
    });
  }

  /**
   * Delete a single host via the `remove-hosts` method.
   * @param {string} hostID
   * @param {object} options
   * @return {Promise}
   */
  removeHost(hostID, options) {
    return this.removeHosts([hostID], options);
  }
}
