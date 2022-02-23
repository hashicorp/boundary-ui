import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';
import { datatype, address, random } from 'faker';

const types = ['static', 'plugin'];
// Represents known plugin types, except "foobar" which models the possibility
// of receiving an _unknown_ type, which the UI must handle gracefully.
const pluginTypes = ['aws', 'azure', 'foobar'];

let pluginTypeCounter = 1;

export default factory.extend({
  id: (i) => `host-catalog-id-${i}`,

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
        description: random.words(),
      };
    }
  },

  attributes() {
    switch (this.plugin?.name) {
      case 'aws':
        return {
          disable_credential_rotation: datatype.boolean(),
          region: address.state(),
        };
      case 'azure':
        return {
          disable_credential_rotation: datatype.boolean(),
          tenant_id: datatype.hexaDecimal(6),
          client_id: datatype.hexaDecimal(6),
          subscription_id: datatype.hexaDecimal(8),
        };
    }
  },

  secrets() {
    switch (this.plugin?.name) {
      case 'aws':
        return {
          access_key_id: datatype.hexaDecimal(8),
          secret_access_key: datatype.string(12),
        };
      case 'azure':
        return {
          secret_id: datatype.hexaDecimal(6),
          secret_value: datatype.string(12),
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
