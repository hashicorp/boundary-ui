/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeStorageBucketsNewController extends Controller {
  @controller('scopes/scope/storage-buckets/index')
  storageBuckets;

  // =services
  @service router;

  // =attributes
  queryParams = ['compositeType'];
}
