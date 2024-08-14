/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexRoute extends Route {
  // =services
  @service ipc;
  @service session;

  // =methods
  async model() {
    let cacheDaemonStatus,
      formattedCacheVersion,
      formattedCliVersion,
      formattedDesktopVersion,
      cacheDaemonErrors = [];

    const { versionNumber: cliVersion } =
      await this.ipc.invoke('getCliVersion');
    formattedCliVersion = `v${cliVersion}`;

    const { desktopVersion } = await this.ipc.invoke('getDesktopVersion');
    formattedDesktopVersion = `v${desktopVersion}`;

    try {
      cacheDaemonStatus = await this.ipc.invoke('cacheDaemonStatus');
    } catch (e) {
      cacheDaemonErrors.push(e);
    }
    const { version, users } = cacheDaemonStatus ?? {};
    formattedCacheVersion = version?.match(/v\d+\.\d+\.\d+/)?.[0];

    // Grab the errors from each resource
    const userId = this.session.data.authenticated.user_id;
    const resourceErrors =
      users
        ?.find((user) => user.id === userId)
        ?.resources.filter((resource) => resource?.last_error?.error)
        ?.map((resource) => ({
          message: resource.last_error.error,
          name: resource.name,
        })) ?? [];
    cacheDaemonErrors = [...cacheDaemonErrors, ...resourceErrors];

    const logLevel = await this.ipc.invoke('getLogLevel');
    const logPath = await this.ipc.invoke('getLogPath');

    return {
      cacheDaemonErrors,
      formattedCliVersion,
      formattedCacheVersion,
      formattedDesktopVersion,
      logLevel,
      logPath,
    };
  }
}
