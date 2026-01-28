/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  connection_recording: belongsTo(),
});
