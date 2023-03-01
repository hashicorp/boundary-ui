/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsNewController extends Controller {
  // =services

  @service intl;

  // =attributes

  queryParams = ['type'];

  /**
   * Translated new auth-method breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.auth-method.titles.new');
  }
}
