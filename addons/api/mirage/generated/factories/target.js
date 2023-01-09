import { Factory } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({
  name: () => faker.random.words(),
  session_max_seconds: () => faker.datatype.number(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),
  default_port: () => faker.datatype.number(),
  version: () => faker.datatype.number(),
});
