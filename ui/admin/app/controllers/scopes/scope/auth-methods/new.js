/**
 * Copyright IBM Corp. 2024, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeAuthMethodsNewController extends Controller {
  @controller('scopes/scope/auth-methods/index') authMethods;

  // =attributes

  queryParams = ['type'];
}
