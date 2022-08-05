import { Factory } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';

/**
 * GeneratedSessionModelFactory
 */
export default Factory.extend({
  type: 'tcp',
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number(),
});
