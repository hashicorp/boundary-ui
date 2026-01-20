/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Controller, { inject as controller } from '@ember/controller';
import { TYPE_TARGET_RDP } from 'api/models/target';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ScopesScopeProjectsSessionsSessionController extends Controller {
  @controller('scopes/scope/projects/sessions/index') sessions;

  // =services

  @service rdp;
  @service confirm;

  // =getters

  /**
   * Whether to show the "Open" button for launching the RDP client.
   * @returns {boolean}
   */
  get showOpenButton() {
    return (
      this.model.target?.type === TYPE_TARGET_RDP &&
      this.rdp.isPreferredRdpClientSet &&
      this.model.id
    );
  }

  // =methods

  @action
  async launchRdpClient() {
    try {
      await this.rdp.launchRdpClient(this.model.id);
    } catch (error) {
      this.confirm
        .confirm(error.message, { isConnectError: true })
        // Retry
        .then(() => this.launchRdpClient());
    }
  }
}
