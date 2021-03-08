import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedUserModelFactory
 * User contains all fields related to a User resource
 */
export default Factory.extend({
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => random.boolean(),
});
