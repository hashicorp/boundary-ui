import Ember from 'ember';
import config from 'ember-get-config';
import { datatype } from 'faker';

export default function initializeMockIPC(server) {
  /**
   * We strive to make this application runnable in a regular web browser, since
   * it is a convenient environment for development and testing.  But only an
   * Electron environment has true IPC.  Outside of Electron, we mock the handling
   * of the message-based IPC requests originating from the
   * renderer (the Ember app).
   */
  class MockIPC {
    async invoke(method, payload) {
      return await this[method](payload);
    }

    origin = null;

    getOrigin() {
      return this.origin;
    }

    setOrigin(origin) {
      this.origin = origin;
      return this.origin;
    }

    resetOrigin() {
      this.origin = null;
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
      return {
        address: window.location.hostname,
        port: datatype.number(),
        protocol: type,
        session_id: newSession.id,
      };
    }

    /**
     * Check for browser running on windows OS
     */
    isWindowsOS() {
      return Boolean(window.navigator.userAgent.match(/(windows)/i));
    }
  }

  /**
   * Establishes a mock IPC handler, which mimics the behavior of the Electron
   * main process, and routes messages to it in a way similar to our
   * preload.js script.
   *
   * Initializes mock IPC only in a non-Electron non-testing context.
   */
  if (!config.isElectron && !Ember.testing) {
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
