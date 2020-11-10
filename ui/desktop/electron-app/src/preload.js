const { ipcRenderer } = require('electron');
const emberAppOrigin = 'serve://boundary';

process.once('loaded', () => {

  /**
   * Ember-land has no access to the renderer or node modules, and thus
   * cannot call into the main process or make invocations directly.
   * In order to communicate with the main process, the Ember app uses
   * the `postMessage` interface to send messages to its browser window.
   * These messages include message ports with which to receive responses from
   * the main process.
   *
   * This preload script simply wires up the forwarding of
   * messages received on the window and responses received from main.
   */
  window.addEventListener('message', async function (event) {
    if (event.origin !== emberAppOrigin) return;
    const response =
      await ipcRenderer.invoke(event.data.method, event.data.payload);
    event.ports[0].postMessage(response);
  });

});
