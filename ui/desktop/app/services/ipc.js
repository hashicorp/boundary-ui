import Service from '@ember/service';
import { Promise } from 'rsvp';

/**
 * An IPC request is a promise-like object that invokes a method on the main
 * process and resolves to its response.
 *
 * Since the renderer cannot call into main or access Node modules directly,
 * it uses the window's `postMessage` interface.  Messages posted in this manner
 * are proxied by `preload.js` to the main process.  This ensures that main
 * and renderer remain isolated and frontend code does not rely on the presence
 * of a main process.
 */
class IPCRequest {

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
   * @param {?string} origin
   */
  constructor(method, payload, origin='serve://boundary') {
    this.method = method;
    this.payload = payload;
    this.origin = origin;
    this.#channel = new MessageChannel();
    this.#promise = new Promise((resolve/*, reject*/) => {
      this.#channel.port1.onmessage = (event) => {
        this.close();
        resolve(event.data);
      }
    });
    window.postMessage({
      method: this.method,
      payload: this.payload
    }, origin, [ this.#channel.port2 ]);
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
 */
export default class IpcService extends Service {

  // =methods

  /**
   * Creates a new IPC request and returns it.
   * @param {string} method
   * @param {object} payload
   * @return {IPCRequest}
   */
  invoke(method, payload) {
    return new IPCRequest(method, payload);
  }

}
