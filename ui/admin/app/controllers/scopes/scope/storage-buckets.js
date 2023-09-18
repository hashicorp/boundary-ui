/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeStorageBucketsController extends Controller {
  // =services

  @service intl;
  queryParams = ['credentialType'];

  // = attributes
  /**
   * Translated breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.storage-bucket.title_plural');
  }
}
