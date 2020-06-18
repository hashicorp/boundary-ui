import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedAuthMethodModelFactory
 */
export default Factory.extend({

  type: 'password',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => random.boolean(),

});
