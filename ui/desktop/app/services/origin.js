import Service from '@ember/service';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { notifyError } from 'core/decorators/notify';

export default class OriginService extends Service {
  // =services

  @service ipc;
  @service store;
  @service storage;

  // =attributes

  /**
   * @type {ApplicationAdapter}
   */
  get adapter() {
    return this.store.adapterFor('application');
  }

  /**
   * @type {?string}
   */
  get rendererOrigin() {
    return this.storage.getItem('origin');
  }

  /**
   * @param {?string} origin
   */
  set rendererOrigin(origin) {
    this.storage.setItem('origin', origin);
  }

  /**
   * @type {Promise{?string}}
   */
  get mainOrigin() {
    return this.ipc.invoke('getOrigin');
  }

  // =methods

  /**
   * Sets the main origin equal to the current renderer origin (if any).
   */
  async updateOrigin() {
    const rendererOrigin = this.rendererOrigin;
    if (rendererOrigin) await this.setOrigin(rendererOrigin);
  }

  /**
   * Validates that the specified origin is a Boundary API.  If so, the app is
   * updated to use the origin.  If it is not a Boundary API, or an origin
   * wasn't specified, throws an error.
   * @param {string} origin - protocol://host:port
   */
  async setOrigin(origin) {
    const originalHost = this.adapter.host;
    assert(
      `setOrigin expects a string, you passed ${origin}`,
      typeof origin === 'string'
    );
    try {
      // Silently drop trailing slashes if present.
      // This is important since API paths that will be appended to the origin
      // will include preceeding slashes already.
      // Trim whitespaces around origin.
      origin = origin.replace(/\/*$/, '').trim();
      this.adapter.host = origin;
      this.rendererOrigin = origin;
      if (origin !== (await this.mainOrigin)) {
        await this.ipc.invoke('setOrigin', origin);
      }
    } catch (e) {
      this.adapter.host = originalHost;
      this.rendererOrigin = null;
      throw e;
    }
  }

  /**
   * Resets the origin.
   */
  @notifyError(({ message }) => message, { catch: true })
  async resetOrigin() {
    this.rendererOrigin = null;
    await this.ipc.invoke('resetOrigin');
  }
}
