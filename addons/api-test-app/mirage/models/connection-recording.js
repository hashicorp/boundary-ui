/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  session_recording: belongsTo(),
  channel_recordings: hasMany(),
});
