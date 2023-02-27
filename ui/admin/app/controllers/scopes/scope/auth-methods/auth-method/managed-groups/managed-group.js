/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupController extends Controller {
  // =attributes

  /**
   * A managed group breadcrumb
   * @type {string}
   */
  get breadCrumb() {
    return this.model.displayName;
  }
}
