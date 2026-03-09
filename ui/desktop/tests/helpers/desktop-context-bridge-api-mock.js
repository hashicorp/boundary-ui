/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */
import sinon from 'sinon';

/**
 * Helper to mock the `window.desktop` API in tests.
 * Use `setupDesktopContextBridgeApiMock(hooks)` in tests and access via `window.desktop`.
 */
export class DesktopContextBridgeAPIMock {
  constructor() {
    this.sandbox = sinon.createSandbox();
    this.clusterUrl = null;

    this.cluster = {
      getClusterUrl: this.sandbox.stub().callsFake(() => {
        return Promise.resolve(this.clusterUrl);
      }),
      setClusterUrl: this.sandbox.stub().callsFake((clusterUrl) => {
        this.clusterUrl = clusterUrl;
        return this.clusterUrl;
      }),
      resetClusterUrl: this.sandbox.stub().callsFake(() => {
        this.clusterUrl = null;
      }),
    };

    this.system = {
      openExternal: this.sandbox.stub().resolves(),
      cliExists: this.sandbox.stub().resolves(true),
      checkCommand: this.sandbox.stub().resolves(false),
      checkOS: this.sandbox.stub().resolves({ isMac: true }),
      getCliVersion: this.sandbox
        .stub()
        .resolves({ versionNumber: 'Boundary CLI v0.1.0' }),
      getDesktopVersion: this.sandbox
        .stub()
        .resolves({ desktopVersion: '1.0.0' }),
    };

    this.session = {
      connectSession: this.sandbox.stub(),
      stopSession: this.sandbox.stub().resolves(true),
      stopAllSessions: this.sandbox.stub().resolves(),
      hasRunningSessions: this.sandbox.stub().resolves(true),
    };

    this.windowAction = {
      hasMacOSChrome: this.sandbox.stub().resolves(false),
      showWindowActions: this.sandbox.stub().resolves(false),
      minimizeWindow: this.sandbox.stub().resolves(),
      toggleFullscreenWindow: this.sandbox.stub().resolves(),
      closeWindow: this.sandbox.stub().resolves(),
      focusWindow: this.sandbox.stub().resolves(),
    };

    this.daemon = {
      addTokenToDaemons: this.sandbox.stub().resolves(),
      searchCacheDaemon: this.sandbox.stub().resolves({}),
      isCacheDaemonRunning: this.sandbox.stub().resolves(false),
      cacheDaemonStatus: this.sandbox
        .stub()
        .resolves({ version: 'Boundary CLI v1.0.0' }),
    };

    this.clientAgent = {
      getClientAgentSessions: this.sandbox.stub().resolves([]),
      isClientAgentRunning: this.sandbox.stub().resolves(false),
      clientAgentStatus: this.sandbox
        .stub()
        .resolves({ version: '0.0.1-dev', status: 'running' }),
      pauseClientAgent: this.sandbox.stub().resolves(),
      resumeClientAgent: this.sandbox.stub().resolves(),
    };

    this.logging = {
      getLogLevel: this.sandbox.stub().resolves('info'),
      setLogLevel: this.sandbox.stub().resolves(),
      getLogPath: this.sandbox
        .stub()
        .resolves('~/.config/Boundary/logs/desktop-client.log'),
    };

    this.rdp = {
      getRdpClients: this.sandbox.stub().resolves([]),
      getPreferredRdpClient: this.sandbox.stub().resolves('none'),
      setPreferredRdpClient: this.sandbox.stub().callsFake((client) => {
        return Promise.resolve(client);
      }),
      launchRdpClient: this.sandbox.stub().resolves(true),
    };

    this.app = {
      onAppQuit: this.sandbox.stub().callsFake((callback) => {
        const listenerCallback = () => callback();
        window.addEventListener('onAppQuit', listenerCallback);
        return () => {
          window.removeEventListener('onAppQuit', listenerCallback);
        };
      }),
    };
  }
}

export function setupDesktopContextBridgeApiMock(hooks) {
  let mockDesktop;

  hooks.beforeEach(function () {
    mockDesktop = new DesktopContextBridgeAPIMock();
    window.desktop = mockDesktop;
    this.searchCacheDaemonStub = window.desktop.daemon.searchCacheDaemon;
  });

  hooks.afterEach(function () {
    mockDesktop.sandbox.restore();
    delete window.desktop;
  });
}
