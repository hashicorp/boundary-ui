import Service from '@ember/service';

class MockIPC {
  clusterUrl = null;

  invoke(method, payload) {
    return this[method](payload);
  }

  getClusterUrl() {
    return this.clusterUrl;
  }

  setClusterUrl(clusterUrl) {
    this.clusterUrl = clusterUrl;
    return this.clusterUrl;
  }

  resetClusterUrl() {}
  hasMacOSChrome() {}
  showWindowActions() {}
}

/**
 * Mock window service with support for simplified postMessage and
 * MessageChannel APIs.  This mock implements just enough functionality
 * to support the IPC mechanism.
 *
 * This mock is necessary to guarantee synchronous and deterministic
 * operation.  The window's own API is evented and asychronous, which
 * cannot be relied on for testing purposes.
 *
 * @todo refactor mock postMessage and MessageChannel for reusability
 *       outside of tests
 */
export default class extends Service {
  // =attributes

  mockIPC = new MockIPC();

  MessageChannel = class MessageChannel {
    constructor() {
      this.port1.postMessage = this.port1.postMessage.bind(this);
      this.port2.postMessage = this.port2.postMessage.bind(this);
    }
    port1 = {
      postMessage() {},
      close() {},
    };
    port2 = {
      postMessage(data) {
        this.port1.onmessage({ data });
      },
      close() {},
    };
  };

  // =methods

  postMessage(data, clusterUrl, ports) {
    if (clusterUrl !== window.location.origin) return;
    const { method, payload } = data;
    if (method) {
      const response = this.mockIPC.invoke(method, payload);
      ports[0].postMessage(response);
    }
  }
}
