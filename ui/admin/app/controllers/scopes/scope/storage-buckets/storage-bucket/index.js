/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeStorageBucketsStorageBucketIndexController extends Controller {
  @controller('scopes/scope/storage-buckets/index')
  storageBuckets;
}
