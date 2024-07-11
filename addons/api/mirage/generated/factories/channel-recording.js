/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

/**
 * GeneratedChannelRecordingModelFactory
 */
export default Factory.extend({
  bytes_up: () => faker.string.numeric(faker.number.int({ min: 1, max: 12 })),
  bytes_down: () => faker.string.numeric(faker.number.int({ min: 1, max: 12 })),
  errors: () => faker.number.int({ max: 10 }),
});
