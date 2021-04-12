import { Factory } from 'ember-cli-mirage';
import { random, date, datatype } from 'faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({
  type: 'tcp',
  name: () => random.words(),
  session_max_seconds: () => datatype.number(),
  session_connection_limit: () => datatype.number(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  disabled: () => datatype.boolean(),
  version: () => datatype.number(),
});
