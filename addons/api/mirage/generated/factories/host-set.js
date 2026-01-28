/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedHostSetModelFactory
 */
export default Factory.extend({
  type: 'static',
  name: () => faker.word.words(),
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.number.int(),
  size: () => faker.number.int(),
});
