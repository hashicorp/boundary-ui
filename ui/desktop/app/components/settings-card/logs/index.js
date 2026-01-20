/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SettingsCardLogsComponent extends Component {
  // =services
  @service ipc;

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
    await this.ipc.invoke('setLogLevel', value);
  }
}
