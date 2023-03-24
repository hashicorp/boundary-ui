/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedConnectionRecordingModelFactory
 */
export default Factory.extend({
  bytes_up: () => faker.datatype.number(),
  bytes_down: () => faker.datatype.number(),
  errors: () => faker.datatype.number({ max: 10 }),
  start_time() {
    return faker.date.recent(3, this.end_time);
  },
  end_time: () => faker.date.recent(),
  duration: () => `${faker.datatype.number()}s`,
});
