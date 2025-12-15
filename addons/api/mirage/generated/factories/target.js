/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({
  name: () => faker.word.words(),
  session_max_seconds: () => faker.number.int(),
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),
  default_port: () => faker.internet.port(),
  default_client_port: () => faker.internet.port(),
  version: () => faker.number.int(),
});
