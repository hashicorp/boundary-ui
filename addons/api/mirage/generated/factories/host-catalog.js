import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedHostCatalogModelFactory
 */
export default Factory.extend({
  type: 'static',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => datatype.boolean(),
});
