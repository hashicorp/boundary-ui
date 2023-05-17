/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedSessionRecordingModelFactory
 */
export default Factory.extend({
  bytes_up: () =>
    faker.random.numeric(faker.datatype.number({ min: 1, max: 12 })),
  bytes_down: () =>
    faker.random.numeric(faker.datatype.number({ min: 1, max: 12 })),
  errors: () => faker.datatype.number({ max: 10 }),
  updated_time: () => faker.date.recent(),
  duration: () => `${faker.datatype.number()}s`,
});
