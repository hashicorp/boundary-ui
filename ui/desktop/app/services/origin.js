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
    if (rendererOrigin) await this.setClusterUrl(rendererOrigin);
  }

  /**
   * Validates that the specified clusterUrl is a Boundary API.  If so, the app is
   * updated to use the clusterUrl.  If it is not a Boundary API, or an clusterUrl
   * wasn't specified, throws an error.
   * @param {string} clusterUrl - protocol://host:port
   */
  async setClusterUrl(clusterUrl) {
    const originalHost = this.adapter.host;
    assert(
      `setOrigin expects a string, you passed ${clusterUrl}`,
      typeof clusterUrl === 'string'
    );
    try {
      // Trim whitespaces and silently drop trailing slashes if present.
      // This is important since API paths that will be appended to the clusterUrl
      // will include preceeding slashes already.
      clusterUrl = clusterUrl.trim();
      clusterUrl = clusterUrl.replace(/\/*$/, '');
      this.adapter.host = clusterUrl;
      this.rendererOrigin = clusterUrl;
      if (clusterUrl !== (await this.mainOrigin)) {
        await this.ipc.invoke('setClusterUrl', clusterUrl);
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
