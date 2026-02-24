/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { loading } from 'ember-loading';
import { notifyError } from 'core/decorators/notify';

export default class SettingsCardClientAgentComponent extends Component {
  // =services
  @service ipc;
  @service router;
  @service loading;

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

  /**
   * Return the button icon based on the current state of the client agent
   * @return {string}
   */
  get buttonIcon() {
    if (this.loading.isLoading) {
      return 'loading';
    } else {
      return this.isClientAgentStatusRunning ? 'pause' : 'play';
    }
  }

  // =actions

  /**
   * Changes the state of the client agent based on the current state.
   * @return {Promise<void>}
   */
  @action
  @loading
  @notifyError(({ message }) => message)
  async changeClientAgentState() {
    if (this.isClientAgentStatusRunning) {
      await this.ipc.invoke('pauseClientAgent');
    } else {
      await this.ipc.invoke('resumeClientAgent');
    }
    // Refresh projects page in order to stop or start
    // polling when client agent status changes.
    await this.router.refresh('scopes.scope.projects');
  }
}
