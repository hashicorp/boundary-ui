import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({

  protocol: 'tcp',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => random.boolean(),
  version: () => random.number(),

});
