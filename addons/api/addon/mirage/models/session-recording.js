/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  scope: belongsTo(),
  connection_recordings: hasMany(),
});
