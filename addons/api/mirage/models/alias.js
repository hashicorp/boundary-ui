/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { belongsTo } from 'miragejs';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
});
