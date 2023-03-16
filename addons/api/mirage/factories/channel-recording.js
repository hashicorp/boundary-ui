/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/channel-recording';
import generateId from '../helpers/id';
import { TYPES_CHANNEL_RECORDING as types } from 'api/models/channel-recording';

export default factory.extend({
  id: () => generateId('srcc_'),
  type: (i) => types[i % types.length],
});
