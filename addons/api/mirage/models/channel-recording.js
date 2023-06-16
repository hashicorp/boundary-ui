/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  connection_recording: belongsTo(),
});
