/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedWorkerModelFactory
 * Worker contains all fields related to a Worker resource
 */
export default Factory.extend({
  name: () => faker.word.words(),
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.number.int(),
  address: () =>
    `${faker.string.uuid()}.proxy.boundary.hashicorp.cloud:${faker.internet.port()}`,
  last_status_time: () => faker.date.recent(),
  active_connection_count: () => faker.number.int(10),
  release_version: () =>
    `Boundary v${faker.number.int(11)}.${faker.number.int(
      50
    )}.${faker.number.int(12)}`,
});
