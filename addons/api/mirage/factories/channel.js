/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import factory from '../generated/factories/channel';
import generateId from '../helpers/id';
import { TYPES_CHANNEL as types } from 'api/models/channel';

export default factory.extend({
  id: () => generateId('srcc_'),
  type: (i) => types[i % types.length],
});
