import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  withChildren: trait({
    afterCreate(hostCatalog, server) {
      const { scope } = hostCatalog;
      const scopePojo = { id: scope.id, type: scope.type };
      const hosts = server.createList('host', 10, { scope: scopePojo, hostCatalog });
      server.createList('host-set', 3, { scope, hostCatalog, hosts });
    }
  })

});
