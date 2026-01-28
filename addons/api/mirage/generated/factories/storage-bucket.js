/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedStorageBucketModelFactory
 */
export default Factory.extend({
  name: () => faker.word.words(),
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.number.int(),
  bucket_name: () => faker.internet.domainWord(),
  bucket_prefix: () => faker.system.directoryPath(),
  worker_filter: () =>
    `"${faker.word.noun()}" in "${faker.system.directoryPath()}"`,
});
