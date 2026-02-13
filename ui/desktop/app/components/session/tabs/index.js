/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import debounce from 'lodash/debounce';
import { service } from '@ember/service';

// This dynamically sets the terminal container's height inline so we have an accurate
// height for the terminal container. This is necessary because we don't have an
// intrinsic height from our parent containers and we don't have any content yet from
// the terminal to have a usable height for the container. This means that calling `.fit()`
// doesn't get an accurate representation of what the container size can actually be
const calculateTerminalContainerHeight = (termContainer) => {
  const rect = termContainer.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  // Calculate the height by getting the viewport height, subtracting what
  // the top offset from the container is, and leaving a small padding to
  // also prevent any overflow scrolling on the container
  const height = viewportHeight - termContainer.offsetTop - 24;
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: height,
  };
};

export default class SessionTerminalTabsComponent extends Component {
  // =services

  @service ipc;

  // =attributes

  terminalViewLoaded = false;

  // =actions

  @action
  async openTerminal() {
    if (this.terminalViewLoaded) {
      return;
    }
    const isSSHCommandAvailable = await this.ipc.invoke('checkCommand', 'ssh');
    const { started_desktop_client, target, id } = this.args.model;

    const autoSSH = Boolean(
      target?.isSSH && started_desktop_client && isSSHCommandAvailable,
    );

    const termContainer = document.getElementById('terminal-container');

    const payload = {
      position: calculateTerminalContainerHeight(termContainer),
      id,
      autoSSH,
    };

    window.webContentView.createTerminalView(payload);
    this.terminalViewLoaded = true;
    // Handle resizing terminal windows. We debounce the resizing as we don't want
    // to resize xterm and the pty process before the previous one has finished
    const debouncedFit = debounce(() => {
      window.webContentView.positionTerminalView(
        calculateTerminalContainerHeight(termContainer),
      );
    }, 150);
    window.onresize = () => {
      debouncedFit();
    };
  }

  @action
  openDetails() {
    this.destroyTerminalView();
  }

  destroyTerminalView() {
    if (this.terminalViewLoaded) {
      window.webContentView.destroyTerminalView();
      this.terminalViewLoaded = false;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    window.onresize = null;
    this.destroyTerminalView();
  }
}
