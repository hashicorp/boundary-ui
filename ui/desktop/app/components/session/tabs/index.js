/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SessionTerminalTabsComponent extends Component {
  // =services

  @service terminal;

  // =actions

  @action
  async openTerminal() {
    this.terminal.setTerminalTabActive(true);

    // If the terminal view is already created, just display the existing one.
    if (this.terminal.isTerminalViewCreated) {
      this.terminal.displayTerminalView();
      return;
    }

    // If the terminal view has not been created yet, we create it.
    const isSSHCommandAvailable =
      await window.desktop.system.checkCommand('ssh');
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
    this.terminal.setTerminalTabActive(false);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.terminal.cleanup();
  }
}
