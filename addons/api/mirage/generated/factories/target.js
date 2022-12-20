import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import { TYPE_TARGET_TCP } from 'api/models/target';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({
  type: TYPE_TARGET_TCP,
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
