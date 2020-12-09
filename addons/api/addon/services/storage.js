import Service from '@ember/service';
import { getOwner } from '@ember/application';
import { get } from '@ember/object';

/**
 * A dead simple memory storage class used by `StorageService` when it
 * is configured for memory-only.
 */
class MemoryStorage {
  /**
   * Internal storage object.
   * @type {object}
   * @private
   */
  #storage = {};

  /**
   * Gets a value from storage.
   * @param {string} key
   * @return {any}
   */
  getItem(key) {
    return this.#storage[key];
  }

  /**
   * Sets a value to storage.
   * @param {string} key
   */
  setItem(key, value) {
    this.#storage[key] = value;
  }

  /**
   * Removes a value from storage.
   * @param {string} key
   */
  removeItem(key) {
    delete this.#storage[key];
  }
}

/**
 * The storage service provides a simple way to persist data in the browser.
 * Most of the time localStorage is used.  Applications may specify in-memory
 * storage via the config, for example:
 *
 *     ENV.storage = {
 *       memory: true
 *     };
 *
 * @example
 *   import Route from '@ember/routing/route';
 *   import { inject as service } from '@ember/service';
 *   export default class ApplicationRoute extends Route {
 *     @service storage;
 *     afterModel() {
 *       this.storage.setItem('key', 'value');
 *     }
 *   }
 */
export default class StorageService extends Service {
  /**
   * @type {MemoryStorage}
   * @private
   */
  #memoryStorage = new MemoryStorage();

  /**
   * Gets the underlying storage mechanism.
   * @return {Storage}
   */
  get storage() {
    // Get the application config to determine if memory storage is enabled
    const config = getOwner(this).resolveRegistration('config:environment');
    const inMemory = get(config, 'storage.memory');
    // Get the global context object (window) via service lookup,
    // because just reaching for a global is icky
    const globalContext = getOwner(this).lookup('service:-document')
      .documentElement.parentNode.defaultView;
    // If memory storage enabled, return the memory storage instance,
    // otherwise return localStorage.
    return inMemory ? this.#memoryStorage : globalContext.localStorage;
  }

  /**
   * Returns the storage namespace, which is the application's `modulePrefix`.
   * @return {string}
   */
  get namespace() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.modulePrefix;
  }

  /**
   * Returns a fully qualified key from the passed string.  A fully qualified
   * key includes the namespace.
   * @param {string} key
   * @return {string} fully qualified key
   */
  qualifiedKey(key) {
    return `${this.namespace}:${key}`;
  }

  /**
   * Gets a value from storage.
   * @param {string} key
   * @return {any}
   */
  getItem(key) {
    const value = this.storage.getItem(this.qualifiedKey(key));
    if (value) return JSON.parse(value);
  }

  /**
   * Sets a value to storage.
   * @param {string} key
   */
  setItem(key, value) {
    this.storage.setItem(this.qualifiedKey(key), JSON.stringify(value));
  }

  /**
   * Removes a value from storage.
   * @param {string} key
   */
  removeItem(key) {
    this.storage.removeItem(this.qualifiedKey(key));
  }
}
