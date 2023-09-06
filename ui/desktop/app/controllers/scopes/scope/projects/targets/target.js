/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import Controller from '@ember/controller';

export default class ScopesScopeProjectsTargetsTargetController extends Controller {
  // =attributes

  queryParams = [{ isConnecting: { type: 'boolean' } }];

  isConnecting = false;
}
