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
      formattedDesktopVersion;
    const { versionNumber: cliVersion } =
      await this.ipc.invoke('getCliVersion');
    formattedCliVersion = `v${cliVersion}`;
    console.log('formattedCliVersion', formattedCliVersion);
    const { desktopVersion } = await this.ipc.invoke('getDesktopVersion');
    formattedDesktopVersion = `v${desktopVersion}`;
    try {
      cacheDaemonStatus = await this.ipc.invoke('cacheDaemonStatus');
    } catch (e) {
      return {
        formattedCliVersion,
        formattedCacheVersion,
        formattedDesktopVersion,
        error: e,
      };
    }
    const { version } = cacheDaemonStatus;
    formattedCacheVersion = version.match(/v\d+\.\d+\.\d+/)?.[0];
    return {
      formattedCliVersion,
      formattedCacheVersion,
      formattedDesktopVersion,
    };
  }
}
