import { Factory } from 'ember-cli-mirage';
import { random, date } from 'faker';

/**
 * GeneratedAccountFactory
 */
export default Factory.extend({
  type: 'password',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => random.number(),
  attributes: () => ({ login_name: random.words() }),
});
