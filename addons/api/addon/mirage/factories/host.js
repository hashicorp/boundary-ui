/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/host';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';
import {
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_DYNAMIC,
} from 'api/models/host-catalog';

export default factory.extend({
  id: () => generateId('h_'),
  name() {
    if (this.type === TYPE_HOST_CATALOG_STATIC) return faker.word.words();
  },
  type() {
    return this.hostCatalog?.type || factory.attrs.type;
  },
  authorized_actions: function () {
    const isStatic = this.type === TYPE_HOST_CATALOG_STATIC;
    const defaults = ['no-op', 'read'];
    // Only static allows update/delete at this time.
    if (isStatic) defaults.push('update', 'delete');
    return permissions.authorizedActionsFor('host') || defaults;
  },
  plugin() {
    if (this.type === TYPE_HOST_CATALOG_DYNAMIC) {
      return this.hostCatalog.plugin;
    }
  },
  ip_addresses() {
    const addressesAmount = Math.floor(Math.random() * 6) + 1;
    let result = [];
    for (let i = 0; i < addressesAmount; ++i) {
      result.push(
        Math.random() > 0.5 ? faker.internet.ip() : faker.internet.ipv6(),
      );
    }
    return result;
  },
  // Return external fields only for plugins
  external_id() {
    if (this.type === TYPE_HOST_CATALOG_DYNAMIC) {
      return faker.string.uuid();
    }
  },
  external_name(i) {
    if (this.type === TYPE_HOST_CATALOG_DYNAMIC) {
      return `${this.plugin.name} provided name ${i}`;
    }
  },
  // Only aws plugins have dns_names
  dns_names() {
    if (this.plugin?.name === 'aws') {
      const dnsNamesAmount = Math.floor(Math.random() * 6) + 1;
      let result = [];
      for (let i = 0; i < dnsNamesAmount; i++) {
        result.push(faker.internet.domainName());
      }
      return result;
    }
  },
});
