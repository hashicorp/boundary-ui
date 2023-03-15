/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { faker } from '@faker-js/faker';

export default function initializeMockIPC(server, config) {
  const isTesting = config.environment === 'test';

  /**
   * We strive to make this application runnable in a regular web browser, since
   * it is a convenient environment for development and testing.  But only an
   * Electron environment has true IPC.  Outside of Electron or with mirage,
   * we mock the handling of the message-based IPC requests originating from the
   * renderer (the Ember app).
   */
  class MockIPC {
    async invoke(method, payload) {
      return await this[method](payload);
    }

    clusterUrl = null;

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
    connect({ target_id }) {
      const target = server.schema.targets.find(target_id);
      const { scope, type } = target;
      const newSession = server.schema.sessions.create({
        scope,
        target,
        userId: 'authenticateduser',
        type,
        created_time: new Date().toISOString(),
      });
      const decoded = {
        key1: 'value 1',
        key2: true,
        key3: 'test',
      };
      const raw = btoa(JSON.stringify(decoded));
      return {
        address: window.location.hostname,
        port: faker.datatype.number(),
        protocol: type,
        session_id: newSession.id,
        credentials: [
          {
            credential_source: {
              id: 'clvlt_4cvscMTl0N',
              name: 'Source Name',
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
              name: 'Source Name',
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
              name: 'Source Name',
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
              name: 'Source Name',
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
      return true;
    }

    /**
     * Do nothing when attempting to minimize, toggle fullscreen,
     * and close a browser window
     */
    minimizeWindow() {}
    closeWindow() {}
    toggleFullscreenWindow() {}
  }

  /**
   * Establishes a mock IPC handler, which mimics the behavior of the Electron
   * main process, and routes messages to it in a way similar to our
   * preload.js script.
   *
   * Initializes mock IPC only in a non-testing context and when mirage is turned on.
   * We mock certain functions even in electron (e.g. hasMacOSChrome) when running
   * locally which will force a certain appearance regardless of platform
   */
  if (config['ember-cli-mirage'].enabled && !isTesting) {
    const mockIPC = new MockIPC();

    window.addEventListener('message', async function (event) {
      if (event.origin !== window.location.origin) return;
      const { method, payload } = event?.data ?? {};
      if (method) {
        const response = await mockIPC.invoke(method, payload);
        event.ports[0].postMessage(response);
      }
    });
  }
}
