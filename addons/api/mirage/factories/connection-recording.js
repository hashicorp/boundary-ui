/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/connection-recording';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';

export default factory.extend({
  id: () => generateId('cr_'),
  connection_id: () => generateId('sc_'),
  start_time(i) {
    return i % 3 === 2
      ? null
      : faker.date.recent({ days: 3, refDate: this.end_time });
  },
  end_time: (i) => (i % 3 === 2 ? null : faker.date.recent()),
  duration: (i) =>
    i % 3 === 2 ? null : `${faker.number.int({ max: 100000 })}s`,
});
