/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/host-catalog';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';

const types = ['static', 'plugin'];
// Represents known plugin types, except "foobar" which models the possibility
// of receiving an _unknown_ type, which the UI must handle gracefully.
const pluginTypes = ['aws', 'azure', 'foobar'];

let pluginTypeCounter = 1;

export default factory.extend({
  id: () => generateId('hc_'),

  // Cycle through available types
  type: (i) => types[i % types.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('host-catalog') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  authorized_collection_actions: function () {
    const isStatic = this.type === 'static';
    return {
      // only static catalogs allow host create at this time
      hosts: isStatic ? ['create', 'list'] : ['list'],
      'host-sets': ['create', 'list'],
    };
  },

  plugin: function (i) {
    if (this.type === 'plugin') {
      return {
        id: `plugin-id-${i}`,
        name: pluginTypes[pluginTypeCounter++ % pluginTypes.length],
        description: faker.word.words(),
      };
    }
  },

  attributes() {
    switch (this.plugin?.name) {
      case 'aws':
        return {
          disable_credential_rotation: faker.helpers.arrayElement([
            'true',
            'false',
          ]),
          region: `us-${faker.location.cardinalDirection()}-${faker.number.int(
            9
          )}`,
        };
      case 'azure':
        return {
          disable_credential_rotation: faker.helpers.arrayElement([
            'true',
            'false',
          ]),
          tenant_id: faker.string.uuid(),
          client_id: faker.string.uuid(),
          subscription_id: faker.string.uuid(),
        };
    }
  },

  secrets() {
    switch (this.plugin?.name) {
      case 'aws':
        return {
          access_key_id: faker.string.nanoid(),
          secret_access_key: faker.string.nanoid(),
        };
      case 'azure':
        return {
          secret_id: faker.string.nanoid(),
          secret_value: faker.string.nanoid(),
        };
    }
  },
  withChildren: trait({
    afterCreate(hostCatalog, server) {
      const { scope, type } = hostCatalog;
      const hosts = server.createList('host', 10, { scope, hostCatalog, type });
      server.createList('host-set', 3, { scope, hostCatalog, hosts, type });
    },
  }),
});
