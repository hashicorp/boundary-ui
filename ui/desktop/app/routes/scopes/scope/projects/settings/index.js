/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexRoute extends Route {
  @service ipc;

  async model() {
    let cacheDaemonStatus,
      formattedCacheVersion,
      formattedCliVersion,
      formattedDesktopVersion,
      error;

    const { versionNumber: cliVersion } =
      await this.ipc.invoke('getCliVersion');
    formattedCliVersion = `v${cliVersion}`;

    const { desktopVersion } = await this.ipc.invoke('getDesktopVersion');
    formattedDesktopVersion = `v${desktopVersion}`;

    try {
      cacheDaemonStatus = await this.ipc.invoke('cacheDaemonStatus');
    } catch (e) {
      error = e;
    }
    const { version } = cacheDaemonStatus ?? {};
    formattedCacheVersion = version?.match(/v\d+\.\d+\.\d+/)?.[0];

    const logLevel = await this.ipc.invoke('getLogLevel');
    const logPath = await this.ipc.invoke('getLogPath');

    return {
      error,
      formattedCliVersion,
      formattedCacheVersion,
      formattedDesktopVersion,
      logLevel,
      logPath,
    };
  }
}
