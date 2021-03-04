import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedOrgModelFactory
 *
 */
export default Factory.extend({
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
});
