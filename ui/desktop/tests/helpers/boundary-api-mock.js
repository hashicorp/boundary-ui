/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */
import sinon from 'sinon';

/**
 * Helper to mock the `window.boundary` API in tests.
 * Use `setupBoundaryAPIMock(hooks)` in tests and access via `window.boundary`.
 */
export class BoundaryAPIMock {
  clusterUrl = null;

  // cluster
  getClusterUrl = sinon.stub().callsFake(function () {
    return Promise.resolve(this.clusterUrl);
  });
  setClusterUrl = sinon.stub().callsFake(function (clusterUrl) {
    this.clusterUrl = clusterUrl;
    return this.clusterUrl;
  });
  resetClusterUrl = sinon.stub().callsFake(function () {
    this.clusterUrl = null;
  });

  openExternal = sinon.stub().resolves();
  cliExists = sinon.stub().resolves(false);
  checkCommand = sinon.stub().resolves(false);
  checkOS = sinon.stub().resolves({ isMac: true });
  getCliVersion = sinon
    .stub()
    .resolves({ versionNumber: 'Boundary CLI v0.1.0' });
  getDesktopVersion = sinon.stub().resolves({ desktopVersion: '1.0.0' });

  // window
  hasMacOSChrome = sinon.stub().resolves(false);
  showWindowActions = sinon.stub().resolves(false);
  minimizeWindow = sinon.stub().resolves();
  toggleFullscreenWindow = sinon.stub().resolves();
  closeWindow = sinon.stub().resolves();
  focusWindow = sinon.stub().resolves();

  // daemon
  addTokenToDaemons = sinon.stub().resolves();
  searchCacheDaemon = sinon.stub().resolves({});
  isCacheDaemonRunning = sinon.stub().resolves(false);
  cacheDaemonStatus = sinon.stub().resolves({ version: 'Boundary CLI v1.0.0' });

  // client agent
  getClientAgentSessions = sinon.stub().resolves([]);
  isClientAgentRunning = sinon.stub().resolves(false);
  clientAgentStatus = sinon
    .stub()
    .resolves({ version: '0.0.1-dev', status: 'running' });
  pauseClientAgent = sinon.stub().resolves();
  resumeClientAgent = sinon.stub().resolves();

  // logging
  getLogLevel = sinon.stub().resolves('info');
  setLogLevel = sinon.stub().resolves();
  getLogPath = sinon
    .stub()
    .resolves('~/.config/Boundary/logs/desktop-client.log');

  // session
  connectSession = sinon.stub();
  stopSession = sinon.stub().resolves();
  stopAllSessions = sinon.stub().resolves();
  hasRunningSessions = sinon.stub().resolves(false);

  // rdp
  getRdpClients = sinon.stub().resolves([]);
  getPreferredRdpClient = sinon.stub().resolves(null);
  setPreferredRdpClient = sinon.stub().callsFake(function (client) {
    return Promise.resolve(client);
  });
  launchRdpClient = sinon.stub().resolves(true);
}

export function setupBoundaryApiMock(hooks) {
  hooks.beforeEach(function () {
    const mockBoundary = new BoundaryAPIMock();
    window.boundary = mockBoundary;
    this.searchCacheDaemonStub = window.boundary.searchCacheDaemon;
  });

  hooks.afterEach(function () {
    sinon.restore();
    delete window.boundary;
  });
}
