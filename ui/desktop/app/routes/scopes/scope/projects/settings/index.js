/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexRoute extends Route {
  @service ipc;

  async model() {
    const { versionNumber: cliVersion } =
      await this.ipc.invoke('getCliVersion');
    const getCacheDaemon = await this.ipc.invoke('getCacheDaemonStatus');
    const { version } = getCacheDaemon;
    // Format the version

    const formattedCacheVersion = version && /(\d+\.\d+\.\d+)/.exec(version)[0];
    const desktopVersion = await this.ipc.invoke('getDesktopVersion');

    return { cliVersion, formattedCacheVersion, desktopVersion };
  }
}
