/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeAuthMethodsNewController extends Controller {
  @controller('scopes/scope/auth-methods/index') authMethods;

  // =services

  // =attributes

  queryParams = ['type'];
}
