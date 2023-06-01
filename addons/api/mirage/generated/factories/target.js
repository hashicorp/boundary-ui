/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedTargetModelFactory
 */
export default Factory.extend({
  name: () => faker.random.words(),
  session_max_seconds: () => faker.datatype.number(),
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  disabled: () => faker.datatype.boolean(),
  default_port: () => faker.datatype.number(),
  default_client_port: () => faker.datatype.number(),
  version: () => faker.datatype.number(),
});
