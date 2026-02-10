/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import { faker } from '@faker-js/faker';

export default function initializeMockBoundaryAPI(server, config) {
  const isTesting = config.environment === 'test';

  /**
   * We strive to make this application runnable in a regular web browser, since
   * it is a convenient environment for development and testing. But only an
   * Electron environment has the true boundaryAPI exposed via contextBridge.
   * Outside of Electron or with mirage, we mock the boundary API object to
   * simulate the Electron preload script's exposed API.
   */
  class MockBoundaryAPI {
    clusterUrl = null;

    checkOS() {
      return {
        isLinux: false,
        isMac: true,
        isWindows: false,
      };
    }

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

    openExternal(href) {
      window.open(href);
    }

    cliExists() {
      return true;
    }

    /**
     * Creates a new session instance associated with the specified target.
     * @param connect_details
     * @param
     */
    connectSession({ target_id }) {
      const target = server.schema.targets.find(target_id);
      const { scope, type } = target;
      const newSession = server.schema.sessions.create({
        scope,
        target,
        userId: 'authenticateduser',
        type,
        created_time: new Date().toISOString(),
        expiration_time: faker.date.soon(),
      });
      const decoded = {
        key1: 'value 1',
        key2: true,
        key3: 'test',
      };
      const raw = btoa(JSON.stringify(decoded));
      return {
        address: window.location.hostname,
        port: faker.internet.port(),
        protocol: type,
        session_id: newSession.id,
        credentials: [
          {
            credential_source: {
              id: 'clvlt_4cvscMTl0N',
              name: 'Credential Library 1',
              description: 'Source Description',
              credential_store_id: 'csvlt_Q1HFGt7Jpm',
              type: 'vault',
            },
            secret: {
              raw: btoa('just-a-random-string'),
            },
          },
          {
            credential_source: {
              id: 'clvlt_4cvscMTl0N',
              name: 'Credential Library 0',
              description: 'Source Description',
              credential_store_id: 'csvlt_Q1HFGt7Jpm',
              type: 'vault-generic',
            },
            secret: {
              raw: 'eyJhcnJheSI6WyJvbmUiLCJ0d28iLCJ0aHJlZSIsIm9uZSIsInR3byIsInRocmVlIiwib25lIiwidHdvIiwidGhyZWUiLCJvbmUiLCJ0d28iLCJ0aHJlZSJdLCJuZXN0ZWQiOnsiYm9vbCI6dHJ1ZSwibG9uZyI6IjEyMjM1MzQ1NmFzZWRmYTQzd3J0ZjIzNGYyM2FzZGdmYXNkZnJnYXdzZWZhd3NlZnNkZjQiLCJzZWNlcmV0Ijoic28gbmVzdGVkIn0sInRlc3QiOiJwaHJhc2UifQ',
              decoded: {
                data: {
                  backslash: 'password\\withslash\\',
                  backslash1: 'password\\fwithslash\\f',
                  password: '123',
                  username: 'test',
                  email: {
                    address: 'test.com',
                  },
                },
                metadata: {
                  created_time: '2024-04-12T18:38:36.226715555Z',
                  custom_metadata: null,
                  deletion_time: '',
                  destroyed: false,
                  version: 8,
                },
              },
            },
          },

          {
            credential_source: {
              id: 'credjson_7cKBbBEkC3',
              credential_store_id: 'csst_yzlsot2pum',
              type: 'static',
              credential_type: 'json',
            },
            secret: {
              raw: 'eyJhcnJheSI6WyJvbmUiLCJ0d28iLCJ0aHJlZSIsIm9uZSIsInR3byIsInRocmVlIiwib25lIiwidHdvIiwidGhyZWUiLCJvbmUiLCJ0d28iLCJ0aHJlZSJdLCJuZXN0ZWQiOnsiYm9vbCI6dHJ1ZSwibG9uZyI6IjEyMjM1MzQ1NmFzZWRmYTQzd3J0ZjIzNGYyM2FzZGdmYXNkZnJnYXdzZWZhd3NlZnNkZjQiLCJzZWNlcmV0Ijoic28gbmVzdGVkIn0sInRlc3QiOiJwaHJhc2UifQ==',
              decoded: {
                secret_key: 'QWERTYUIOP',
                secret_access_key: 'QWERT.YUIOP234567890',
                nested_secret: {
                  session_token: 'ZXCVBNMLKJHGFDSAQWERTYUIOP0987654321',
                  complex_nest: {
                    blackslash: 'password\\withslash\\',
                    hash: 'qazxswedcvfrtgbnjhyujm.1234567890',
                  },
                },
              },
            },
            credential: {
              secret_key: 'QWERTYUIOP',
              secret_access_key: 'QWERT.YUIOP234567890',
              nested_secret: {
                session_token: 'ZXCVBNMLKJHGFDSAQWERTYUIOP0987654321',
                complex_nest: {
                  hash: 'qazxswedcvfrtgbnjhyujm.1234567890',
                },
              },
            },
          },
          {
            credential_source: {
              id: 'clvlt_4cvscMTl0N',
              name: 'Credential Library 2',
              description: 'Source Description',
              credential_store_id: 'csvlt_Q1HFGt7Jpm',
              type: 'vault',
            },
            secret: {
              raw,
              decoded,
            },
          },
          {
            credential_source: {
              id: 'clvlt_9KWscxpcY7',
              name: 'Credential Library 3',
              description: 'Source Description',
              credential_store_id: 'csvlt_Q1HFGt7Jpm',
              type: 'vault',
            },
            secret: {
              raw: btoa('just-a-random-string'),
            },
          },
          {
            credential_source: {
              id: 'clvlt_9KWscxpcY7',
              name: 'Credential Library 4',
              description: 'Source Description',
              credential_store_id: 'csvlt_Q1HFGt7Jpm',
              type: 'vault',
            },
            secret: {
              raw,
              decoded,
            },
          },
        ],
      };
    }

    /**
     * Check for window chrome on MacOS
     */
    hasMacOSChrome() {
      return true;
    }

    /**
     * Check for OS chrome state
     */
    showWindowActions() {
      if (navigator.userAgent.includes('Mac')) {
        return false;
      }
      return true;
    }

    /**
     * Do nothing when attempting to minimize, toggle fullscreen,
     * and close a browser window
     * * Do nothing when canceling a session invokes the stop method
     */
    minimizeWindow() {}
    closeWindow() {}
    toggleFullscreenWindow() {}
    stopSession() {}
    checkCommand() {
      return faker.system.filePath();
    }
    addTokenToDaemons() {}
    searchCacheDaemon() {}
    isCacheDaemonRunning() {
      return false;
    }
    isClientAgentRunning() {
      return false;
    }
    cacheDaemonStatus() {
      return { version: 'Boundary v1.0.0' };
    }
    getCliVersion() {
      return { versionNumber: '1.0.0' };
    }
    getDesktopVersion() {
      return { desktopVersion: '1.0.0' };
    }
    getLogLevel() {
      return 'info';
    }
    getLogPath() {
      return '~/.config/Boundary/logs/desktop-client.log';
    }
    setLogLevel() {}
    clientAgentStatus() {
      return { version: '0.0.1-dev', status: 'running' };
    }
    pauseClientAgent() {}
    resumeClientAgent() {}
    hasRunningSessions() {}
    stopAllSessions() {}
    getRdpClients() {
      return ['windows-app', 'none', 'mstsc'];
    }
    getPreferredRdpClient() {
      return 'windows-app';
    }
    getRecommendedRdpClient() {
      return {
        name: 'windows-app',
        link: 'https://apps.apple.com/us/app/windows-app/id1295203466',
      };
    }
    setPreferredRdpClient() {}
    launchRdpClient() {}
  }

  /**
   * Initializes mock only in a non-testing environment and when mirage is enabled.
   * In browser mode, creates the API. In Electron mode, the API already exists
   * from contextBridge and we can't override it
   */
  if (config.mirage?.enabled && !isTesting) {
    const boundaryAPIMock = new MockBoundaryAPI();
    // Only in browser mode, we create the boundary API object not in Electron mode because they already exist from contextBridge
    if (!window.boundary) {
      window.boundary = boundaryAPIMock;
    }
  }
}
