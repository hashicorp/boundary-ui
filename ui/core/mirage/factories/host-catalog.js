import factory from '../generated/factories/host-catalog';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  /**
   * Create catalogs with associated host sets and hosts.
   */
  withChildren: trait({
    afterCreate(record, server) {
      const host_set_ids = server.createList('host-set', 3).map(set => set.id);
      record.update({ host_set_ids });
    }
  })

});
