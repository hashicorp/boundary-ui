/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedScopeModelFactory
 */
export default Factory.extend({
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),
});
