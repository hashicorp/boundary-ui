import { Factory } from 'ember-cli-mirage';
import { random, date, datatype, internet } from 'faker';

/**
 * GeneratedWorkerModelFactory
 * User contains all fields related to a Worker resource
 */
export default Factory.extend({
  name: () => random.words(),
  description: () => random.words(),
  created_time: () => date.recent(),
  updated_time: () => date.recent(),
  version: () => datatype.number(),
  address: () => `${internet.ipv6()}${internet.port()}`,
  last_status_time: () => date.recent(),
  active_connection_count: () => datatype.number(),
});
