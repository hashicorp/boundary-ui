/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedSessionModelFactory
 */
export default Factory.extend({
  type: 'tcp',
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  expiration_time: () => faker.date.soon(),
  version: () => faker.number.int(),
});
