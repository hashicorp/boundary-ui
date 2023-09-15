/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import GeneratedHostModel from '../generated/models/host';
import { attr } from '@ember-data/model';
import {
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_PLUGIN,
  TYPE_PLUGIN_AWS,
  TYPE_PLUGIN_AZURE,
} from './host-catalog';

export default class HostModel extends GeneratedHostModel {
  // =attributes

  // Static specific fields
  @attr('string', {
    description: 'The address (DNS or IP name) used to reach the host',
    isNestedAttribute: true,
  })
  address;

  // Plugin specific fields
  @attr({
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  ip_addresses;

  @attr('string', {
    description: '',
    readOnly: true,
  })
  external_id;

  @attr('string', {
    description: 'The external facing name for the plugin based host.',
    readOnly: true,
  })
  external_name;

  // Aws specific
  @attr({
    readOnly: true,
    emptyArrayIfMissing: true,
  })
  dns_names;

  /**
   * True if the host is static.
   * @type {boolean}
   */
  get isStatic() {
    return this.type === TYPE_HOST_CATALOG_STATIC;
  }

  /**
   * True if the host is plugin.
   * @type {boolean}
   */
  get isPlugin() {
    return this.type === 'plugin';
  }

  /**
   * True if the host plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === TYPE_PLUGIN_AWS;
  }

  /**
   * True if the host plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === TYPE_PLUGIN_AZURE;
  }

  /**
   * If host is a plugin return `plugin.name`,
   * otherwise return the host type.
   * @type {string}
   */
  get compositeType() {
    return this.isPlugin ? this.plugin.name : this.type;
  }

  /**
   * Sets `type`. If type is different than `static`, sets `type` to `plugin`
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

  // Plugin hosts can support an external name
  get displayName() {
    return this.name || this.external_name || this.id;
  }
}
