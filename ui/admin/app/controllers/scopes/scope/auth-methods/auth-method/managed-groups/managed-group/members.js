/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupMembersController extends Controller {
  // =services

  @service intl;

  // =attributes
  /**
   * Translated new managed group breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.intl.t('resources.managed-group.member.title_plural');
  }
}
