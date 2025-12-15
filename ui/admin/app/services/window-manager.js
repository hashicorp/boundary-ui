/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { service } from '@ember/service';

/**
 * The window manager service enables browser windows to open and close
 * without the need to retain window references at the callsite.
 */
export default class WindowManagerService extends Service {
  // =services

  @service('browser/window') window;

  // =attributes

  /**
   * An array of windows under management.
   * @private
   * @type {[Window]}
   */
  #managedWindows = [];

  // =methods

  /**
   * Opens a new window of the specified URL via browser services.
   * @param {string} url
   * @see `window.open`
   */
  open(url) {
    const newWindow = this.window.open(url);
    if (newWindow) this.add(newWindow);
  }

  /**
   * Closes all windows under management and purges their references.
   * @see `window.close`
   */
  closeAll() {
    this.#managedWindows.forEach((window) => window.close());
    this.purgeAll();
  }

  /**
   * Adds a window to management.
   * @param {Window} window
   */
  add(window) {
    this.#managedWindows.push(window);
  }

  /**
   * Resets the managed windows array.  As long as no array references are
   * retained, this should result in the original array being GC'd.
   */
  purgeAll() {
    this.#managedWindows = [];
  }
}
