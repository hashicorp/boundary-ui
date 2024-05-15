/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopeTargetsNewController extends Controller {
  @controller('scopes/scope/targets/index') targets;

  // =attributes

  queryParams = ['type'];
}
