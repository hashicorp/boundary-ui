import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedStorageBucketModelFactory
 */
export default Factory.extend({
  type: 'plugin',
  name: () => faker.random.words(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number(),
  bucket_name: () => faker.internet.domainWord(),
  bucket_prefix: () => faker.system.directoryPath(),
  worker_filter: () => faker.random.words(),
});
