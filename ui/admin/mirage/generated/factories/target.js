import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({

  type: 'tcp',
  name: () => random.words(),
  session_max_seconds: () => random.number(),
  session_connection_limit: () => random.number(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => random.boolean(),
  version: () => random.number(),

});
