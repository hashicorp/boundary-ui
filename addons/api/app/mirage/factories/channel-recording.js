/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import factory from '../generated/factories/channel-recording';
import generateId from '../helpers/id';
import { faker } from '@faker-js/faker';
import { MIME_TYPE_ASCIICAST } from 'api/models/channel-recording';

export default factory.extend({
  id: () => generateId('chr_'),
  start_time(i) {
    return i % 3 === 2
      ? null
      : faker.date.recent({ days: 3, refDate: this.end_time });
  },
  end_time: (i) => (i % 3 === 2 ? null : faker.date.recent()),
  duration: (i) =>
    i % 3 === 2 ? null : `${faker.number.int({ max: 100000 })}s`,
  mime_types: (i) => (i % 3 === 2 ? null : [MIME_TYPE_ASCIICAST]),
});
