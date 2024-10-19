/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
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

  @action
  toggleModal(value) {
    this.isConnecting = value;
  }

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
          // in a transition or have a host modal open
          this.isConnectionError = false;
        });
    }
  }

  /**
   * Establish a session to current target.
   * @param {TargetModel} target
   * @param {HostModel} host
   * hostConnect is only called when making a connection with a host and ensures that the host modal is automatically closed in the case of a connection error.
   */
  @action
  async hostConnect(target, host) {
    await this.connect(target, host);

    if (this.isConnectionError) {
      this.toggleModal(false);
      this.isConnectionError = false;
    }
  }

  /**
   * Determine if we show host modal or quick connect based on target attributes.
   * @param {TargetModel} model
   * @param {function} toggleModal
   */
  @action
  async preConnect(model) {
    /**
     * if hosts length is 1 or less we will try to
     * connect, even if there is no address on the target and
     * rely on the CLI to give the user the proper error or if
     * there are 2 or more hosts we show the modal for host selection
     */
    if (model.hosts.length <= 1) {
      await this.connect(model.target);
    } else {
      this.toggleModal(true);
    }
  }
}
