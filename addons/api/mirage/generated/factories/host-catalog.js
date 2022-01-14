import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedHostCatalogModelFactory
 */
export default Factory.extend({
  type: () => random.arrayElement(['static', 'plugin']),
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => datatype.boolean(),
  plugin: function (i) {
    if (this.type == 'plugin') {
      return {
        id: `pl_${datatype.hexaDecimal(5)}`,
        name: random.arrayElement(['azure', 'aws']),
        description: random.words(),
      };
    }
  },
});
