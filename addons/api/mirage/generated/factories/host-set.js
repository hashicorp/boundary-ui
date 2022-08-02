import { Factory } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';

/**
 * GeneratedHostSetModelFactory
 */
export default Factory.extend({
  type: 'static',
  name: () => faker.random.words(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number(),
  size: () => faker.datatype.number(),
});
