import { Factory } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({
  type: 'tcp',
  name: () => faker.random.words(),
  session_max_seconds: () => faker.datatype.number(),
  session_connection_limit: () => faker.datatype.number(),
  worker_filter: () => faker.random.words(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),
  version: () => faker.datatype.number(),
});
