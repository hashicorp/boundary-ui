/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedAppTokenFactory
 */
export default Factory.extend({
  name: () => faker.word.words(),
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  token: () => faker.string.alphanumeric(50),
  approximate_last_access_time: () => faker.date.recent(),
  expire_time: () => faker.date.soon(),
  time_to_live_seconds: () => faker.number.int(),
  time_to_stale_seconds: () => faker.number.int(),
  version: () => faker.number.int(),
});
