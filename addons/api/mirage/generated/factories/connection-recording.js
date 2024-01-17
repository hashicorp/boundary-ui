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
  bytes_up: () => faker.string.numeric(faker.number.int({ min: 1, max: 12 })),
  bytes_down: () => faker.string.numeric(faker.number.int({ min: 1, max: 12 })),
  errors_number: () => faker.number.int({ max: 10 }),
});
