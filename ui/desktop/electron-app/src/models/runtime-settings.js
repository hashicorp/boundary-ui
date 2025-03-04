/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

const { netRequest } = require('../helpers/request-promise.js');
const store = require('../services/electron-store-manager');

// Runtime settings are any configuration, especially user-specified,
// set up at runtime.  For example, the Boundary clusterUrl is a runtime setting.
class RuntimeSettings {
  /**
   * The user-specified Boundary clusterUrl, which should be allowed by CSP.
   * @type {?string}
   */
  get clusterUrl() {
    return store.get('clusterUrl');
  }

  /**
   * Sets the user specified Boundary clusterUrl.
   * @param value {string}
   */
  set clusterUrl(value) {
    store.set('clusterUrl', value);
  }

  /**
   * Validates the clusterUrl is reachable and has a scopes endpoint.
   */
  async validateClusterUrl(clusterUrl) {
    // If the clusterUrl is the Electron clusterUrl, it is automatically valid.
    if (clusterUrl === 'serve://boundary') return true;
    // Otherwise, check if scopes can be loaded from the specified clusterUrl.
    // Scopes are required by the desktop client, so this is a simple smoke
    // test to see if the clusterUrl is API-compatible with the desktop client.
    const scopesEndpoint = `${clusterUrl}/v1/scopes`;
    try {
      const result = await netRequest(scopesEndpoint);
      // Redirects (3xx) are handled in the netRequest Promise, so we only
      // throw an error for 4xx or 5xx responses.
      if (result.statusCode >= 400) {
        throw new Error();
      }
    } catch (e) {
      throw new Error(`Cluster URL ${clusterUrl} could not be validated.`);
    }
  }

  /**
   * Sets the clusterUrl to null.
   */
  resetClusterUrl() {
    store.delete('clusterUrl');
  }

  // Quick and dirty event handler pattern to enable the application to respond
  // when the clusterUrl is changed.
  #clusterUrlWatchers = [];

  onClusterUrlChange(fn) {
    this.#clusterUrlWatchers.push(fn);
  }

  async triggerClusterUrlUpdate(clusterUrl) {
    if (this.clusterUrl !== clusterUrl) {
      this.clusterUrl = clusterUrl;
      for (const fn of this.#clusterUrlWatchers) {
        // We currently only store one function but this will execute serially
        // which may or may not be the desired behavior if there ever is more
        await fn(this.clusterUrl);
      }
    }
  }
}

module.exports = RuntimeSettings;
