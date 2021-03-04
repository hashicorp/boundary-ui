import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedSessionModelFactory
 */
export default Factory.extend({
  type: 'tcp',
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => random.number(),
});
