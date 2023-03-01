/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Model from './base';
import { belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  scope: belongsTo(),
  hostSets: hasMany(),
});
