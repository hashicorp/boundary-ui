import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedHostSetModelFactory
 */
export default Factory.extend({
  type: 'static',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
  size: () => datatype.number(),
  plugin: function (i) {
    if (this.type == 'plugin') {
      return {
        id: `pl_${datatype.hexaDecimal(5)}`,
        name: i % 2 ? 'aws' : 'azure',
        description: random.words(),
      };
    }
  },
});
