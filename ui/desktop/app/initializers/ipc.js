import Ember from 'ember';
import config from '../config/environment';

/**
 * We strive to make this application runnable in a regular web browser, since
 * it is a convenient environment for development and testing.  But only an
 * Electron environment has true IPC.  Outside of Electron, we mock the handling
 * of the message-based IPC requests originating from the
 * renderer (the Ember app).
 */
class MockIPC {
  async invoke(method, payload) {
    console.log('MockIPC:', method, payload);
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
}

/**
 * Establishes a mock IPC handler, which mimics the behavior of the Electron
 * main process, and routes messages to it in a way similar to our
 * preload.js script.
 *
 * Initializes mock IPC only in a non-Electron non-testing context.
 */
export function initialize() {
  if (!config.isElectron && !Ember.testing) {
    const mockIPC = new MockIPC();
    window.addEventListener('message', async function (event) {
      if (event.origin !== window.location.origin) return;
      const { method, payload } = event.data;
      if (method) {
        const response =
          await mockIPC.invoke(method, payload);
        event.ports[0].postMessage(response);
      }
    });
  }
}

export default { initialize };
