import factory from '../generated/factories/scope';
import { trait } from 'ember-cli-mirage';
import { random } from 'faker';

export default factory.extend({

  type: 'global',

  id() {
    const id = new Array(10).fill(0).map(() => random.alphaNumeric()).join('');
    return `s_${id}`;
  },

  withChildren: trait({
    afterCreate(record, server) {
      if (record.type === 'global') {
        server.createList('scope', 1, {
          type: 'org',
          scope: { id: record.id, type: record.type }
        }, 'withChildren');
      }
      if (record.type === 'org') {
        server.createList('scope', 3, {
          type: 'project',
          scope: { id: record.id, type: record.type }
        });
      }
    }
  })

});
