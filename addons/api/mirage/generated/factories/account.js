import { Factory } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';

/**
 * GeneratedAccountFactory
 */
export default Factory.extend({
  type: 'password',
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number(),
});
