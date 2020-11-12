import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { Promise } from 'rsvp';
import config from '../config/environment';

/**
 * An IPC request is a promise-like object that issues a request via
 * `window.postMessage` and resolves to a response received via a response
 * port.  IPC requests are used by an Electron renderer process to communicate
 * with the main process when the renderer is fully isolated.
 *
 * Some of the design goals of this "safe IPC" are to respect the confines
 * of process isolation and security, without using node integration, while
 * retaining the ability to run the Ember application within a browser
 * (sans main process) by using only APIs available in a standard
 * (non-Electron) browser.  This is achieved by posting messages to the
 * renderer's `window.postMessage` interface.  Thus, the renderer requires no
 * knowledge of the main process or the Electron context.  In fact a main
 * process and Electron context are not even required.
 *
 * In an Electron context, the `preload.js` script sets up a `window.postMessge`
 * listener which acts as proxy layer between the main and renderer processes.
 * It waits for incoming requests from the renderer and forwards them to main.
 * Responses from the main process are forwarded back via a response port
 * (sent with the original request).
 *
 * Local development in a non-Electron browser context or test context should
 * mock up IPC requests.  See the ipc service test for an example of mocking.
 *
 * TODO: add utilities for quickly mocking IPC responses (like Mirage)
 *
 */
export class IPCRequest {
  // =attributes

  /**
   * @type {?MessageChannel}
   * @private
   */
  #channel = null;

  /**
   * @type {?Promise}
   * @private
   */
  #promise = null;

  // =methods

  /**
   * Posts a message to the window object, along with a MessagePort
   * with which to receive a response.  An internal promise is generated which
   * resolves to the response.
   * @param {string} method
   * @param {object} payload
   * @param {Window} window - A reference to the window object
   * @param {?string} origin
   */
  constructor(method, payload, window, origin = config.ipc.defaultOrigin) {
    this.method = method;
    this.payload = payload;
    this.origin = origin;
    this.#channel = new MessageChannel();
    this.#promise = new Promise((resolve /*, reject*/) => {
      this.#channel.port1.onmessage = (event) => {
        this.close();
        resolve(event.data);
      };
    });
    window.postMessage(
      {
        method: this.method,
        payload: this.payload,
      },
      origin,
      [this.#channel.port2]
    );
  }

  /**
   * Closes the message ports and drops the channel reference.
   * This is called upon receiving a response for cleanup purposes.
   */
  close() {
    this.#channel.port1.close();
    this.#channel.port2.close();
    this.#channel = null;
  }

  /**
   * Proxies to the underlying promise.
   */
  then() {
    return this.#promise.then(...arguments);
  }

  /**
   * Proxies to the underlying promise.
   */
  catch() {
    return this.#promise.catch(...arguments);
  }

  /**
   * Proxies to the underlying promise.
   */
  finally() {
    return this.#promise.finally(...arguments);
  }
}

/**
 * A simple factory for generating IPCRequests in Ember.
 * @example
 *
 *   class MyClass {
 *     @service ipc;
 *
 *     makeRequest {
 *       return this.ipc.invoke('getFoobars', { hello: 'world' });
 *     }
 *   }
 */
export default class IpcService extends Service {
  // =attributes

  /**
   * Looks up the window object indirectly.
   * @type {Window}
   */
  get window() {
    // The Ember way of accessing globals...
    const document = getOwner(this).lookup('service:-document').documentElement;
    // defaultView === window, but without using globals directly
    return document.parentNode.defaultView;
  }

  // =methods

  /**
   * Creates a new IPC request and returns it.
   * @param {string} method
   * @param {object} payload
   * @param {object} origin
   * @return {IPCRequest}
   */
  invoke(method, payload, origin) {
    return new IPCRequest(method, payload, this.window, origin);
  }
}
