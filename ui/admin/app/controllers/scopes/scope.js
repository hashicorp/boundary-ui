/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class ScopesScopeController extends Controller {
  // =services

  @service session;
  @service scope;
}
