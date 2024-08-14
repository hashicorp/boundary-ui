/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SettingsCardLogsComponent extends Component {
  // =services
  @service ipc;

  // =attributes

  get logLevels() {
    return ['error', 'warn', 'info', 'debug'];
  }

  // =methods
  @action
  async selectLogLevel({ target: { value } }) {
    await this.ipc.invoke('setLogLevel', value);
  }
}
