import factory from '../generated/factories/target';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  withChildren: trait({
    afterCreate(target, server) {
      const scope = target.scope;
      const hosts = server.createList('host', 10, { scope });
      server.createList('host-set', 3, { scope, target , hosts});
    }
  })

});
