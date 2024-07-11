/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeProjectsTargetsTargetController extends Controller {
  // =attributes

  queryParams = [{ isConnecting: { type: 'boolean' } }];

  @tracked isConnecting = false;

  // =methods

  @action
  toggleModal(value) {
    this.isConnecting = value;
  }
}
