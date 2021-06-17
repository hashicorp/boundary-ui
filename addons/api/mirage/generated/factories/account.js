import { Factory } from 'ember-cli-mirage';
import { date, datatype } from 'faker';

/**
 * GeneratedAccountFactory
 */
export default Factory.extend({
  type: 'password',
  // name: () => random.words(),
  // description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
});
