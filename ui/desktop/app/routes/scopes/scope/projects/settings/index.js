/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexRoute extends Route {

  @service ipc;

  async model() {
    const {versionNumber} = await this.ipc.invoke('getCliVersion');     
    const cliExists = await this.ipc.invoke('cliExists');
    const isCacheDaemonRunning = await this.ipc.invoke(
      'isCacheDaemonRunning',
    );
    console.log('isCacheDaemonRunning', isCacheDaemonRunning);
    return {versionNumber, cliExists, isCacheDaemonRunning };
  }
}
