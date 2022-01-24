import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';
import { datatype, address } from 'faker';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('host-catalog') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  authorized_collection_actions: () => {
    return {
      hosts: ['create', 'list'],
      'host-sets': ['create', 'list'],
    };
  },
  attributes() {
    switch (this.plugin?.name) {
      case 'aws':
        return {
          disable_credential_rotation: datatype.boolean(),
          tenant_id: datatype.hexaDecimal(6),
          client_id: datatype.hexaDecimal(6),
          subscription_id: datatype.hexaDecimal(8),
          secret_id: datatype.hexaDecimal(6),
          secret_value: datatype.string(12),
        };
      case 'azure':
        return {
          disable_credential_rotation: datatype.boolean(),
          region: address.state(),
          access_key_id: datatype.hexaDecimal(8),
          secret_access_key: datatype.string(12),
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
