import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedCredentialModelFactory
 */
export default Factory.extend({
  name: () => faker.random.words(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number(),
});
