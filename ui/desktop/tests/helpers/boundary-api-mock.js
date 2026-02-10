/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

/**
 * Helper to mock the `window.boundary` API in tests.
 * Use `setupBoundaryAPIMock(hooks)` in tests and access via `window.boundary`.
 */
export class BoundaryAPIMock {
  clusterUrl = null;

  // cluster
  getClusterUrl() {
    return this.clusterUrl;
  }
  setClusterUrl(clusterUrl) {
    this.clusterUrl = clusterUrl;
    return this.clusterUrl;
  }
  resetClusterUrl() {
    this.clusterUrl = null;
  }

  openExternal() {}
  cliExists() {
    return false;
  }
  checkCommand() {
    return false;
  }
  checkOS() {
    return { isMac: true };
  }
  getCliVersion() {
    return { versionNumber: 'Boundary CLI v0.1.0' };
  }
  getDesktopVersion() {
    return { desktopVersion: '1.0.0' };
  }

  // window
  hasMacOSChrome() {}
  showWindowActions() {}
  minimizeWindow() {}
  toggleFullscreenWindow() {}
  closeWindow() {}
  focusWindow() {}

  // daemon
  addTokenToDaemons() {}
  searchCacheDaemon() {}
  isCacheDaemonRunning() {
    return false;
  }
  cacheDaemonStatus() {
    return { version: 'Boundary CLI v1.0.0' };
  }

  // client agent
  getClientAgentSessions() {
    return [];
  }
  isClientAgentRunning() {
    return false;
  }
  clientAgentStatus() {
    return { version: '0.0.1-dev', status: 'running' };
  }
  pauseClientAgent() {}
  resumeClientAgent() {}

  // logging
  getLogLevel() {
    return 'info';
  }
  setLogLevel() {}
  getLogPath() {
    return '~/.config/Boundary/logs/desktop-client.log';
  }

  // session
  connectSession() {}
  stopSession() {}
  stopAllSessions() {}
  hasRunningSessions() {
    return false;
  }

  // rdp
  getRdpClients() {
    return [];
  }
  getPreferredRdpClient() {
    return null;
  }
  setPreferredRdpClient(client) {
    return client;
  }
  launchRdpClient() {
    return true;
  }
}

export function setupBoundaryApiMock(hooks) {
  hooks.beforeEach(function () {
    const mockBoundary = new BoundaryAPIMock();
    window.boundary = mockBoundary;
  });

  hooks.afterEach(function () {
    delete window.boundary;
  });
}
