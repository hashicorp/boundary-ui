/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SettingsCardLogsComponent extends Component {
  // =attributes

  /**
   * Returns the list of available log levels
   * @return {string[]}
   */
  get logLevels() {
    return ['error', 'warn', 'info', 'debug'];
  }

  // =methods

  /**
   * Sets the log level to the selected value
   * @param value
   * @return {Promise<void>}
   */
  @action
  async selectLogLevel({ target: { value } }) {
    await window.boundary.setLogLevel(value);
  }
}
