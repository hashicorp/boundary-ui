/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexRoute extends Route {
  @service ipc;

  async model() {
    const { versionNumber } = await this.ipc.invoke('getCliVersion');
    const cliExists = await this.ipc.invoke('cliExists');
    const getCacheDaemonVersion = await this.ipc.invoke(
      'getCacheDaemonVersion',
    );
    return { versionNumber, cliExists, getCacheDaemonVersion };
  }
}
