/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Route from '@ember/routing/route';

export default class ScopesScopeStorageBucketsStorageBucketRoute extends Route {
  model() {
    return {
      scope_id: 'sb_1234567890',
    };
  }
}
