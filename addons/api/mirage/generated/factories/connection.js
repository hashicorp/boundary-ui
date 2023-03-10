/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedConnectionModelFactory
 */
export default Factory.extend({
  bytes_up: () => faker.datatype.number(),
  bytes_down: () => faker.datatype.number(),
  errors: () => faker.datatype.number({ max: 10 }),
  started_time() {
    return faker.date.recent(3, this.finished_time);
  },
  finished_time: () => faker.date.recent(),
});
