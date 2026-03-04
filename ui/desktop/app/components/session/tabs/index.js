/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SessionTerminalTabsComponent extends Component {
  // =services

  @service ipc;
  @service terminal;

  // =actions

  @action
  async openTerminal() {
    // If the terminal view is already created but not opened, we can skip creating a new terminal view and just display the existing one.
    if (this.terminal.isTerminalViewCreated) {
      this.terminal.displayTerminalView();
      return;
    }
    const isSSHCommandAvailable = await this.ipc.invoke('checkCommand', 'ssh');
    const { started_desktop_client, target, id } = this.args.model;

    const autoSSH = Boolean(
      target?.isSSH && started_desktop_client && isSSHCommandAvailable,
    );

    const payload = {
      id,
      autoSSH,
    };

    this.terminal.createTerminalView(payload);
  }

  /**
   * When the details tab is clicked, we want to hide the terminal view
   */
  @action
  openDetails() {
    this.terminal.hideTerminalView();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.terminal.cleanup();
  }
}
