/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';

export default class ScopesScopeStorageBucketsRoute extends Route {
  model() {
    // Temporary placeholder
    return [{ scope_id: 'sb_123456' }];
  }
}
