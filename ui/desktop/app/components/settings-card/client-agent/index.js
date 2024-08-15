/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';

export default class SettingsCardClientAgentComponent extends Component {
  // =services
  @service ipc;
  @service router;

  // =attributes

  /**
   * Checks if the status returned by the client agent is "running"
   * @return {boolean}
   */
  get isClientAgentStatusRunning() {
    return this.args.model.clientAgentStatus?.status === 'running';
  }

  /**
   * Checks if the client agent is actively running
   * @return {boolean}
   */
  get isClientAgentActive() {
    return (
      this.args.model.clientAgentStatus?.status === 'running' ||
      this.args.model.clientAgentStatus?.status === 'paused'
    );
  }

  // =actions

  @action
  @loading
  @notifyError(({ message }) => message)
  async pauseClientAgent() {
    await this.ipc.invoke('pauseClientAgent');
    await this.router.refresh();
  }

  @action
  @loading
  @notifyError(({ message }) => message)
  async resumeClientAgent() {
    await this.ipc.invoke('resumeClientAgent');
    await this.router.refresh();
  }
}
