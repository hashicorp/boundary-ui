import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  withChildren: trait({
    afterCreate(hostCatalog, server) {
      const { scope } = hostCatalog;
      const hosts = server.createList('host', 10, { scope, hostCatalog });
      server.createList('host-set', 3, { scope, hostCatalog, hosts });
    }
  })

});
