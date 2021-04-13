import { Factory } from 'ember-cli-mirage';
import { date, datatype } from 'faker';

/**
 * GeneratedSessionModelFactory
 */
export default Factory.extend({
  type: 'tcp',
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
});
