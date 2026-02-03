/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { belongsTo, hasMany } from 'miragejs';
import Model from './base';

export default Model.extend({
  scope: belongsTo(),
  users: hasMany(),
  groups: hasMany(),
  managedGroups: hasMany(),
});
