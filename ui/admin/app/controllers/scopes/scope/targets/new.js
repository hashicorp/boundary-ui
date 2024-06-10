/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeTargetsNewController extends Controller {
  @controller('scopes/scope/targets/index') targets;

  // =attributes

  queryParams = ['type'];
}
