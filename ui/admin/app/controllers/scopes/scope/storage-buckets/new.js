/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';

export default class ScopesScopeStorageBucketsNewController extends Controller {
  @controller('scopes/scope/storage-buckets/index')
  storageBuckets;

  // =services
  @service router;

  // =attributes
  queryParams = ['compositeType'];
}
