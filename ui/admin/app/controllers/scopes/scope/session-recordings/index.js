/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ScopesScopeSessionRecordingsIndexController extends Controller {
  // =attributes

  queryParams = ['page', 'pageSize'];

  @tracked page = 1;
  @tracked pageSize = 10;

  /**
   * Returns true if any session recordings exist
   * @type {boolean}
   */
  get hasSessionRecordings() {
    return !!this.model?.sessionRecordings?.length;
  }

  /**
   * Returns true if any storage buckets exist
   * @type {boolean}
   */
  get hasSessionRecordingsConfigured() {
    return !!this.model?.storageBuckets?.length;
  }
}
