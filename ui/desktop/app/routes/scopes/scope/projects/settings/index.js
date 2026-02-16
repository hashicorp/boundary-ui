/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScopesScopeProjectsSettingsIndexRoute extends Route {
  // =services
  @service ipc;
  @service session;
  @service clusterUrl;

  // =methods
  async model() {
    const { versionNumber: cliVersion } =
      await this.ipc.invoke('getCliVersion');

    const { desktopVersion } = await this.ipc.invoke('getDesktopVersion');
    const cacheDaemonStatus = await this.getCacheStatus();
    const clientAgentStatus = await this.getClientAgentStatus();

    const logLevel = await this.ipc.invoke('getLogLevel');
    const logPath = await this.ipc.invoke('getLogPath');
    const serverInformation = this.clusterUrl.rendererClusterUrl;

    return {
      desktopVersion: `v${desktopVersion}`,
      cliVersion: `v${cliVersion}`,
      cacheDaemonStatus,
      clientAgentStatus,
      logLevel,
      logPath,
      serverInformation,
    };
  }

  async getCacheStatus() {
    let cacheDaemonStatus;
    let cacheDaemonStatusError = [];
    try {
      cacheDaemonStatus = await this.ipc.invoke('cacheDaemonStatus');
    } catch (e) {
      cacheDaemonStatusError.push(e);
    }
    const { version, users } = cacheDaemonStatus ?? {};
    const cacheVersion = version?.match(/v\d+\.\d+\.\d+/)?.[0];

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

    const errors = [...cacheDaemonStatusError, ...resourceErrors];
    return { version: cacheVersion, errors };
  }

  async getClientAgentStatus() {
    let clientAgentStatus;
    let clientAgentStatusError = [];
    try {
      clientAgentStatus = await this.ipc.invoke('clientAgentStatus');
    } catch (e) {
      clientAgentStatusError.push(e);
    }

    const { version, status, errors: errorMessages } = clientAgentStatus ?? {};
    const statusErrors = errorMessages?.map((message) => ({ message })) ?? [];

    const errors = [...clientAgentStatusError, ...statusErrors];
    return { version: `v${version}`, status, errors };
  }
}
