/**
 * Copyright IBM Corp. 2021, 2026
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { assert } from '@ember/debug';
import { service } from '@ember/service';
import { notifyError } from 'core/decorators/notify';

export default class ClusterUrlService extends Service {
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
  get rendererClusterUrl() {
    return this.storage.getItem('cluster-url');
  }

  /**
   * @param {?string} clusterUrl
   */
  set rendererClusterUrl(clusterUrl) {
    this.storage.setItem('cluster-url', clusterUrl);
  }

  /**
   * @type {Promise{?string}}
   */
  get mainClusterUrl() {
    return this.ipc.invoke('getClusterUrl');
  }

  // =methods

  /**
   * Sets the main clusterUrl equal to the current renderer clusterUrl (if any).
   */
  async updateClusterUrl() {
    const rendererClusterUrl = this.rendererClusterUrl;
    if (rendererClusterUrl) await this.setClusterUrl(rendererClusterUrl);
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
      `setClusterUrl expects a string, you passed ${clusterUrl}`,
      typeof clusterUrl === 'string',
    );
    try {
      // Trim whitespaces and silently drop trailing slashes if present.
      // This is important since API paths that will be appended to the clusterUrl
      // will include preceeding slashes already.
      clusterUrl = clusterUrl.trim();
      clusterUrl = clusterUrl.replace(/\/*$/, '');
      this.adapter.host = clusterUrl;
      this.rendererClusterUrl = clusterUrl;
      if (clusterUrl !== (await this.mainClusterUrl)) {
        await this.ipc.invoke('setClusterUrl', clusterUrl);
      }
    } catch (e) {
      this.adapter.host = originalHost;
      this.rendererClusterUrl = null;
      throw e;
    }
  }

  /**
   * Resets the clusterUrl.
   */
  @notifyError(({ message }) => message, {
    catch: true,
    log: { origin: 'resetClusterUrl' },
  })
  async resetClusterUrl() {
    this.rendererClusterUrl = null;
    await this.ipc.invoke('resetClusterUrl');
  }
}
