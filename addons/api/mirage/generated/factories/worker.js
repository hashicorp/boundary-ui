import { Factory } from 'miragejs';
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
  release_version: () =>
    `Boundary v${faker.datatype.number({ max: 11 })}.${faker.datatype.number({
      max: 50,
    })}.${faker.datatype.number({ max: 12 })}`,
});
