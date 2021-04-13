import { Factory } from 'ember-cli-mirage';
import { random, date, internet, datatype } from 'faker';

/**
 * GeneratedHostModelFactory
 */
export default Factory.extend({
  type: 'static',
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
  attributes: () => {
    return { address: internet.ipv6() };
  },
});
