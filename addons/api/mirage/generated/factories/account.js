/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';
import { TYPE_AUTH_METHOD_PASSWORD } from 'api/models/auth-method';

/**
 * GeneratedAccountFactory
 */
export default Factory.extend({
  type: TYPE_AUTH_METHOD_PASSWORD,
  description: () => faker.random.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.datatype.number(),
});
