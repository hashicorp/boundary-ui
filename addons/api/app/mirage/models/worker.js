/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import { belongsTo } from 'miragejs';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
});
