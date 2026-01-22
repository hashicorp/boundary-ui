/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/host-set';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';
import {
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
} from 'api/models/host-catalog';

function generateFilters(prefix) {
  const filtersAmount = faker.number.int({ min: 1, max: 5 });
  let filters = [];
  for (let i = 0; i < filtersAmount; ++i) {
    filters.push(`${prefix}${faker.word.words(1)}=${faker.word.words(1)}`);
  }
  return {
    filters,
  };
}

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
      const endpointsAmount = faker.number.int({ min: 1, max: 5 });
      let result = [];
      for (let i = 0; i < endpointsAmount; ++i) {
        result.push(
          Math.random() > 0.5 ? faker.internet.ip() : faker.internet.ipv6(),
        );
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
    switch (this.plugin?.name) {
      case TYPE_HOST_CATALOG_PLUGIN_AWS:
        return generateFilters('tag:');
      case TYPE_HOST_CATALOG_PLUGIN_AZURE:
        return {
          filter: `${faker.database.column()}=${faker.database.collation()}`,
        };
      case TYPE_HOST_CATALOG_PLUGIN_GCP:
        return generateFilters('labels.');
    }
  },
});
