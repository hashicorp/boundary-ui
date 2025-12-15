/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedHostSetModel from '../generated/models/host-set';
import {
  TYPES_HOST_CATALOG_PLUGIN,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
} from './host-catalog';

export default class HostSetModel extends GeneratedHostSetModel {
  // =attributes

  /**
   * Returns if the host-set is static or not.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === 'static';
  }

  /**
   * Returns if the host-set is plugin or not.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * True if the host set is an unknown type.
   * @type {boolean}
   */
  get isUnknown() {
    return (
      this.isPlugin && !TYPES_HOST_CATALOG_PLUGIN.includes(this.plugin?.name)
    );
  }

  /**
   * Returns if a host-set plugin is AWS or not
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === TYPE_HOST_CATALOG_PLUGIN_AWS;
  }

  /**
   * Return if a host-set plugin is Azure or not.
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
   * If a host-set is a plugin return its name,
   * otherwise returns the host-set type
   * @type {string}
   */
  get compositeType() {
    if (this.isUnknown) return 'unknown';
    if (this.isPlugin) return this.plugin.name;
    return 'static';
  }

  /**
   * Sets type, if type is different than static, set plugin name to type
   */
  set compositeType(type) {
    if (type === 'static') {
      this.type = 'static';
    } else {
      this.type = 'plugin';
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
