/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  connection_recording: belongsTo(),
});
