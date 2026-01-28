/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import { TYPE_ALIAS_TARGET } from 'api/models/alias';

/**
 * GeneratedAliasModelFactory
 */
export default Factory.extend({
  name: () => faker.word.words(),
  type: TYPE_ALIAS_TARGET,
  value: () => faker.word.words(),
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.number.int(),
});
