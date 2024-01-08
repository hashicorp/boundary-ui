/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedStoragePolicyModelFactory
 */
export default Factory.extend({
  name: () => faker.word.words(),
  type: 'storage',
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.number.int(),
});