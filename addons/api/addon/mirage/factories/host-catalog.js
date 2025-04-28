/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/host-catalog';
import { trait } from 'miragejs';
import permissions from '../helpers/permissions';
import { faker } from '@faker-js/faker';
import generateId from '../helpers/id';
import {
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  TYPE_HOST_CATALOG_PLUGIN_GCP,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_STATIC,
  TYPE_HOST_CATALOG_DYNAMIC,
  TYPES_HOST_CATALOG,
} from 'api/models/host-catalog';

// Represents known plugin types, except "foobar" which models the possibility
// of receiving an _unknown_ type, which the UI must handle gracefully.
const pluginTypes = [
  TYPE_HOST_CATALOG_PLUGIN_GCP,
  TYPE_HOST_CATALOG_PLUGIN_AWS,
  TYPE_HOST_CATALOG_PLUGIN_AZURE,
  'foobar',
];

export default factory.extend({
  id: () => generateId('hc_'),

  // Cycle through available types
  type: (i) => TYPES_HOST_CATALOG[i % TYPES_HOST_CATALOG.length],

  authorized_actions: () =>
    permissions.authorizedActionsFor('host-catalog') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  authorized_collection_actions: function () {
    const isStatic = this.type === TYPE_HOST_CATALOG_STATIC;
    return {
      // only static catalogs allow host create at this time
      hosts: isStatic ? ['create', 'list'] : ['list'],
      'host-sets': ['create', 'list'],
    };
  },

  worker_filter: function () {
    if (
      this.type === TYPE_HOST_CATALOG_DYNAMIC &&
      (this.plugin?.name === TYPE_HOST_CATALOG_PLUGIN_AWS ||
        this.plugin?.name === TYPE_HOST_CATALOG_PLUGIN_GCP)
    ) {
      return `"${faker.word.noun()}" in "${faker.system.directoryPath()}"`;
    }
  },

  plugin: function (i) {
    if (this.type === TYPE_HOST_CATALOG_DYNAMIC) {
      return {
        id: `plugin-id-${i}`,
        name: pluginTypes[i % pluginTypes.length],
        description: faker.word.words(),
      };
    }
  },

  attributes() {
    switch (this.plugin?.name) {
      case TYPE_HOST_CATALOG_PLUGIN_AWS:
        return {
          disable_credential_rotation: faker.datatype.boolean(),
          region: `us-${faker.location.cardinalDirection()}-${faker.number.int(
            9,
          )}`,
        };
      case TYPE_HOST_CATALOG_PLUGIN_AZURE:
        return {
          disable_credential_rotation: faker.datatype.boolean(),
          tenant_id: faker.string.uuid(),
          client_id: faker.string.uuid(),
          subscription_id: faker.string.uuid(),
        };
      case TYPE_HOST_CATALOG_PLUGIN_GCP:
        return {
          disable_credential_rotation: faker.datatype.boolean(),
          project_id: faker.string.uuid(),
          client_email: faker.internet.email(),
          target_service_account_id: faker.string.uuid(),
          zone: `us-${faker.location.cardinalDirection()}${faker.number.int(
            9,
          )}-${faker.string.fromCharacters('abc')}`,
        };
    }
  },

  secrets() {
    switch (this.plugin?.name) {
      case TYPE_HOST_CATALOG_PLUGIN_AWS:
        return {
          access_key_id: faker.string.nanoid(),
          secret_access_key: faker.string.nanoid(),
        };
      case TYPE_HOST_CATALOG_PLUGIN_AZURE:
        return {
          secret_id: faker.string.nanoid(),
          secret_value: faker.string.nanoid(),
        };
      case TYPE_HOST_CATALOG_PLUGIN_GCP:
        return {
          private_key: faker.string.nanoid(),
          private_key_id: faker.string.nanoid(),
        };
    }
  },
  withChildren: trait({
    afterCreate(hostCatalog, server) {
      const { scope, type } = hostCatalog;
      const hosts = server.createList('host', 10, { scope, hostCatalog, type });
      const hostSets = server.createList('host-set', 3, {
        scope,
        hostCatalog,
        hosts,
        type,
      });
      const hostSetIds = hostSets.map((hostSet) => hostSet.id);
      hosts.forEach((host) => {
        host.update({ hostSetIds });
      });
    },
  }),
});
