/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/host';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';

export default factory.extend({
  id: () => generateId('h_'),

  type() {
    return this.hostCatalog?.type || factory.attrs.type;
  },
  authorized_actions: function () {
    const isStatic = this.type === 'static';
    const defaults = ['no-op', 'read'];
    // Only static allows update/delete at this time.
    if (isStatic) defaults.push('update', 'delete');
    return permissions.authorizedActionsFor('host') || defaults;
  },
  plugin() {
    if (this.type === 'plugin') {
      return this.hostCatalog.plugin;
    }
  },
  ip_addresses() {
    const addressesAmount = Math.floor(Math.random() * 6) + 1;
    let result = [];
    for (let i = 0; i < addressesAmount; ++i) {
      result.push(faker.internet.ip());
    }
    return result;
  },
  external_id() {
    return faker.datatype.uuid();
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
