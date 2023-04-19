/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  scope: belongsTo(),
  connection_recordings: hasMany(),
});
