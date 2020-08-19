import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  withChildren: trait({
    afterCreate(hostCatalog, server) {
      const scope = hostCatalog.scope;
      // Hosts and host sets are supposed to be associated to a host catalog.
      // For simplicity of mocks, we don't actually associate them here.
      server.createList('host-set', 3, { scope, hostCatalog });
      server.createList('host', 10, { scope, hostCatalog });
    }
  })

});
