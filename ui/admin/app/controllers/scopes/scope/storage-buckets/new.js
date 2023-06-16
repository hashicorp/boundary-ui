/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeStorageBucketsNewController extends Controller {
  // =services

  @service intl;

  /**
   * Breadcrumb for new route
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.storage-bucket.titles.new');
  }
}
