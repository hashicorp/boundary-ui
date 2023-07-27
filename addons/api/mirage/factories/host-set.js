/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/host-set';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';

export default factory.extend({
  id: () => generateId('hs_'),
  type() {
    return this.hostCatalog?.type || factory.attrs.type;
  },
  authorized_actions: function () {
    const isStatic = this.type === 'static';
    const defaults = ['no-op', 'read', 'update', 'delete'];
    // Only static allows host management at this time.
    if (isStatic) defaults.push('add-hosts', 'remove-hosts');
    return permissions.authorizedActionsFor('host-set') || defaults;
  },
  plugin() {
    if (this.type === 'plugin') {
      return this.hostCatalog.plugin;
    }
  },
  preferred_endpoints() {
    if (this.type === 'plugin') {
      const enpointsAmount = faker.number.int({ min: 1, max: 5 });
      let result = [];
      for (let i = 0; i < enpointsAmount; ++i) {
        result.push(faker.internet.ip());
      }
      return result;
    }
  },
  sync_interval_seconds() {
    if (this.type === 'plugin') {
      return faker.number.int();
    }
  },

  attributes() {
    // AWS specific
    if (this.plugin?.name === 'aws') {
      const filtersAmount = faker.datatype.number({ min: 1, max: 5 });
      let filters = [];
      for (let i = 0; i < filtersAmount; ++i) {
        filters.push(`${faker.datatype.string(3)}=${faker.datatype.string(8)}`);
      }
      return {
        filters,
      };
    }
    // Azure specific
    if (this.plugin?.name === 'azure') {
      return {
        filter: `${faker.database.column()}=${faker.database.collation()}`,
      };
    }
  },
});
