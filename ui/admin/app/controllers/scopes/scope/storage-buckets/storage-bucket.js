/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeStorageBucketsStorageBucketController extends Controller {
  // =attributes
  queryParams = ['type'];
  /**
   * A storage-bucket breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
