/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedHostModelFactory
 */
export default Factory.extend({
  type: 'static',
  description: () => faker.word.words(),
  created_time: () => faker.date.recent(),
  updated_time: () => faker.date.recent(),
  version: () => faker.number.int(),
  attributes: () => {
    return {
      address:
        Math.random() > 0.5 ? faker.internet.ip() : faker.internet.ipv6(),
    };
  },
});
