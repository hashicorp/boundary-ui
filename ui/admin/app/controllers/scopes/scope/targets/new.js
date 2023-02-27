/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeTargetsNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = ['type'];

  // =attributes

  /**
   * Translated roles breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.target.titles.new');
  }
}
