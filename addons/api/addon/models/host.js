/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import GeneratedHostModel from '../generated/models/host';
import { attr } from '@ember-data/model';
import { TYPES_HOST_CATALOG_PLUGIN } from './host-catalog';

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
    return this.type === 'static';
  }

  /**
   * True if the host is plugin.
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
   * True if the host plugin type is AWS.
   * @type {boolean}
   */
  get isAWS() {
    return this.compositeType === 'aws';
  }

  /**
   * True if the host plugin type is Azure.
   * @type {boolean}
   */
  get isAzure() {
    return this.compositeType === 'azure';
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
    if (type === 'static') {
      this.type = 'static';
    } else {
      this.type = 'plugin';
      this.plugin = { name: type };
    }
  }

  // Plugin hosts can support an external name
  get displayName() {
    return this.name || this.external_name || this.id;
  }
}
