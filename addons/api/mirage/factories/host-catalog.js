import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';
import permissions from '../helpers/permissions';

export default factory.extend({
  authorized_actions: () =>
    permissions.authorizedActionsFor('host-catalog') || [
      'no-op',
      'read',
      'update',
      'delete',
    ],
  withChildren: trait({
    afterCreate(hostCatalog, server) {
      const { scope } = hostCatalog;
      const hosts = server.createList('host', 10, { scope, hostCatalog });
      server.createList('host-set', 3, { scope, hostCatalog, hosts });
    },
  }),
});
