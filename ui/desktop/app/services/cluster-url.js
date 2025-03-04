/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

import Service from '@ember/service';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import { notifyError } from 'core/decorators/notify';

export default class ClusterUrlService extends Service {
  // =services

  @service ipc;
  @service store;

  // =attributes

  /**
   * @type {ApplicationAdapter}
   */
  get adapter() {
    return this.store.adapterFor('application');
  }

  // =methods

  async getClusterUrl() {
    return this.ipc.invoke('getClusterUrl');
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
      if (clusterUrl !== (await this.getClusterUrl())) {
        await this.ipc.invoke('setClusterUrl', clusterUrl);
      }
    } catch (e) {
      this.adapter.host = originalHost;
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
    await this.ipc.invoke('resetClusterUrl');
  }
}
