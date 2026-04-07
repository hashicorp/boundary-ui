/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import debounce from 'lodash/debounce';

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

export default class TerminalService extends Service {
  // =properties

  @tracked isTerminalViewCreated = false;

  /**
   * Helps track whether the terminal tab is active so we can determine whether to display/hide the existing terminal view
   */
  @tracked isTerminalTabActive = false;

  /**
   * Tracks whether the app side nav is minimized i.e. collapsed so we can determine whether to display/hide the existing terminal view
   */
  @tracked isSideNavMinimized = true;

  get terminalPosition() {
    const termContainer = document.getElementById('terminal-container');
    return calculateTerminalContainerHeight(termContainer);
  }

  // =methods

  setTerminalTabActive(isActive) {
    this.isTerminalTabActive = isActive;

    if (!isActive) {
      return this.hideTerminalView();
    }
  }

  setSideNavMinimized(isMinimized) {
    this.isSideNavMinimized = isMinimized;
  }

  /**
   * Displays the existing terminal view if it has already been created and is not currently open.
   */
  displayTerminalView() {
    window.webContentView.positionTerminalView(this.terminalPosition);
  }

  /**
   * Hides the terminal view. We do this instead of destroying the view because we want to preserve the state of the terminal session.
   */
  hideTerminalView() {
    return window.webContentView?.hideTerminalView();
  }

  createTerminalView(payload) {
    const updatedPayload = {
      ...payload,
      position: this.terminalPosition,
    };
    window.webContentView.createTerminalView(updatedPayload);
    this.isTerminalViewCreated = true;
    // Handle resizing terminal windows. We debounce the resizing as we don't want
    // to resize xterm and the pty process before the previous one has finished
    const debouncedFit = debounce(() => {
      window.webContentView.positionTerminalView(this.terminalPosition);
    }, 150);
    window.onresize = () => {
      debouncedFit();
    };
  }

  cleanup() {
    window.webContentView?.destroyTerminalView();
    window.onresize = null;
    this.isTerminalViewCreated = false;
    this.isTerminalTabActive = false;
    this.isSideNavMinimized = false;
  }
}
