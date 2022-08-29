import { Factory } from 'ember-cli-mirage';
import { faker } from '@faker-js/faker';

/**
 * GeneratedWorkerModelFactory
 * Worker contains all fields related to a Worker resource
 */
export default Factory.extend({
  name: () => faker.random.words(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number({ max: 4 }),
  address: () =>
    `${faker.datatype.uuid()}.proxy.boundary.hashicorp.cloud:${faker.internet.port()}`,
  last_status_time: () => faker.date.recent(),
  active_connection_count: () => faker.datatype.number({ max: 10 }),
});
