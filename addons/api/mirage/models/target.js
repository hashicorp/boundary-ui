/**
 * Copyright IBM Corp. 2024, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Model from './base';
import { belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  scope: belongsTo(),
  hostSets: hasMany(),
});
