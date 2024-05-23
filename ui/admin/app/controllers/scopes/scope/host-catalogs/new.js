/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeHostCatalogsNewController extends Controller {
  @controller('scopes/scope/host-catalogs/index') hostCatalogs;

  // =attributes

  queryParams = ['type'];
}
