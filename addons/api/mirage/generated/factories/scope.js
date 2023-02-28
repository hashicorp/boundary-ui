import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import * as fakeData from '../../helpers/fake-data';

/**
 * GeneratedScopeModelFactory
 */
export default Factory.extend({
  name: () => fakeData.name(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),
});
