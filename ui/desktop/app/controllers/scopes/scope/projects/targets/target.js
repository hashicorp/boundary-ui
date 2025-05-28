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

  @tracked page = 1;
  @tracked pageSize = 10;
  @tracked totalItems = this.model.hosts.length;
  @tracked paginatedHosts = this.paginateHosts;

  @tracked isConnecting = false;
  isConnectionError = false;

  // =methods

  get paginateHosts() {
    return this.model.hosts.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize,
    );
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
          // in a transition
          this.isConnectionError = false;
        });
    }
  }

  @action
  async handlePageChange(page) {
    this.page = page;

    this.paginatedHosts = this.paginateHosts;
  }

  @action
  async handlePageSizeChange(pageSize) {
    this.page = 1;
    this.pageSize = pageSize;

    this.paginatedHosts = this.paginateHosts;
  }
}
