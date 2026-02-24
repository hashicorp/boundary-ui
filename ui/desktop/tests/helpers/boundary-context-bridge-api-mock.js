/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */
import sinon from 'sinon';

/**
 * Helper to mock the `window.boundary` API in tests.
 * Use `setupBoundaryContextBridgeApiMock(hooks)` in tests and access via `window.boundary`.
 */
export class BoundaryContextBridgeAPIMock {
  constructor() {
    this.sandbox = sinon.createSandbox();
    this.clusterUrl = null;

    // cluster
    this.getClusterUrl = this.sandbox.stub().callsFake(() => {
      return Promise.resolve(this.clusterUrl);
    });
    this.setClusterUrl = this.sandbox.stub().callsFake((clusterUrl) => {
      this.clusterUrl = clusterUrl;
      return this.clusterUrl;
    });
    this.resetClusterUrl = this.sandbox.stub().callsFake(() => {
      this.clusterUrl = null;
    });

    this.openExternal = this.sandbox.stub().resolves();
    this.cliExists = this.sandbox.stub().resolves(true);
    this.checkCommand = this.sandbox.stub().resolves(false);
    this.checkOS = this.sandbox.stub().resolves({ isMac: true });
    this.getCliVersion = this.sandbox
      .stub()
      .resolves({ versionNumber: 'Boundary CLI v0.1.0' });
    this.getDesktopVersion = this.sandbox
      .stub()
      .resolves({ desktopVersion: '1.0.0' });

    // window
    this.hasMacOSChrome = this.sandbox.stub().resolves(false);
    this.showWindowActions = this.sandbox.stub().resolves(false);
    this.minimizeWindow = this.sandbox.stub().resolves();
    this.toggleFullscreenWindow = this.sandbox.stub().resolves();
    this.closeWindow = this.sandbox.stub().resolves();
    this.focusWindow = this.sandbox.stub().resolves();

    // daemon
    this.addTokenToDaemons = this.sandbox.stub().resolves();
    this.searchCacheDaemon = this.sandbox.stub().resolves({});
    this.isCacheDaemonRunning = this.sandbox.stub().resolves(false);
    this.cacheDaemonStatus = this.sandbox
      .stub()
      .resolves({ version: 'Boundary CLI v1.0.0' });

    // client agent
    this.getClientAgentSessions = this.sandbox.stub().resolves([]);
    this.isClientAgentRunning = this.sandbox.stub().resolves(false);
    this.clientAgentStatus = this.sandbox
      .stub()
      .resolves({ version: '0.0.1-dev', status: 'running' });
    this.pauseClientAgent = this.sandbox.stub().resolves();
    this.resumeClientAgent = this.sandbox.stub().resolves();

    // logging
    this.getLogLevel = this.sandbox.stub().resolves('info');
    this.setLogLevel = this.sandbox.stub().resolves();
    this.getLogPath = this.sandbox
      .stub()
      .resolves('~/.config/Boundary/logs/desktop-client.log');

    // session
    this.connectSession = this.sandbox.stub();
    this.stopSession = this.sandbox.stub().resolves(true);
    this.stopAllSessions = this.sandbox.stub().resolves();
    this.hasRunningSessions = this.sandbox.stub().resolves(true);

    // rdp
    this.getRdpClients = this.sandbox.stub().resolves([]);
    this.getPreferredRdpClient = this.sandbox.stub().resolves('none');
    this.setPreferredRdpClient = this.sandbox.stub().callsFake((client) => {
      return Promise.resolve(client);
    });
    this.launchRdpClient = this.sandbox.stub().resolves(true);
  }
}

export function setupBoundaryContextBridgeApiMock(hooks) {
  let mockBoundary;

  hooks.beforeEach(function () {
    mockBoundary = new BoundaryContextBridgeAPIMock();
    window.boundary = mockBoundary;
    this.searchCacheDaemonStub = window.boundary.searchCacheDaemon;
  });

  hooks.afterEach(function () {
    mockBoundary.sandbox.restore();
    delete window.boundary;
  });
}
