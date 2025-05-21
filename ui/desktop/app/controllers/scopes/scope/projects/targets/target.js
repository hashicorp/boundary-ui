/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ScopesScopeProjectsTargetsTargetController extends Controller {
  @controller('scopes/scope/projects/targets/index') targets;

  // =services

  @service store;
  @service confirm;

  // =attributes

  queryParams = [{ isConnecting: { type: 'boolean' } }];

  @tracked isConnecting = false;
  isConnectionError = false;

  // =methods

  /**
   * Connect method that calls parent connect method and handles
   * connection errors unique to this route
   * @param {TargetModel} target
   * @param {HostModel} host
   */
  @action
  async connect(target, host) {
    try {
      await this.targets.connect(target, host);
    } catch (error) {
      this.isConnectionError = true;
      this.confirm
        .confirm(error.message, { isConnectError: true })
        // Retry
        .then(() => this.connect(target, host))
        .catch(() => {
          // Reset the flag as this was user initiated and we're not
          // in a transition
          this.isConnectionError = false;
        });
    }
  }
}
