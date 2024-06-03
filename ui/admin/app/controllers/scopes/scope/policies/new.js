/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';

export default class ScopesScopePoliciesNewController extends Controller {
  @controller('scopes/scope/policies/index') policies;
}
