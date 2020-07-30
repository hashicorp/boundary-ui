import factory from '../generated/factories/scope';
import { trait } from 'ember-cli-mirage';

export default factory.extend({

  type: 'global',

  withChildren: trait({
    afterCreate(record, server) {
      if (record.type === 'global') {
        server.createList('scope', 1, {
          type: 'org',
          scope: { id: record.id, type: record.type }
        }, 'withChildren');
      }
      if (record.type === 'org') {
        server.createList('scope', 5, {
          type: 'project',
          scope: { id: record.id, type: record.type }
        });
      }
    }
  })

});
