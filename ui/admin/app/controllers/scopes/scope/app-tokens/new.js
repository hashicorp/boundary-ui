/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeAppTokensNewController extends Controller {
  @controller('scopes/scope/app-tokens/index') appTokens;

  // =attributes

  queryParams = ['cloneAppToken'];
}
