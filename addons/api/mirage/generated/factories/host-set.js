import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedHostSetModelFactory
 */
export default Factory.extend({
  type: () => this.hostCatalog.type,
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
  size: () => datatype.number(),
});
