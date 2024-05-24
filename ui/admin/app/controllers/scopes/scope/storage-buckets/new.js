/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
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
