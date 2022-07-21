const netRequestPromise = require('../helpers/net-request-promise.js');

// Runtime settings are any configuration, especially user-specified,
// set up at runtime.  For example, the Boundary clusterUrl is a runtime setting.
class RuntimeSettings {
  // Internal private clusterUrl is exposed via getter/setter below.
  #clusterUrl = undefined;

  /**
   * The user-specified Boundary clusterUrl, which should be allowed by CSP.
   * @type {?string}
   */
  get clusterUrl() {
    return this.#clusterUrl;
  }
  set clusterUrl(clusterUrl) {
    if (this.#clusterUrl !== clusterUrl) {
      this.#clusterUrl = clusterUrl;
      this.triggerClusterUrlChanged();
    }
  }

  /**
   * Validates the clusterUrl is reachable and has a scopes endpoint.
   */
  async validateOrigin(clusterUrl) {
    // If the clusterUrl is the Electron clusterUrl, it is automatically valid.
    if (clusterUrl === 'serve://boundary') return true;
    // Otherwise, check if scopes can be loaded from the specified clusterUrl.
    // Scopes are required by the desktop client, so this is a simple smoke
    // test to see if the clusterUrl is API-compatible with the desktop client.
    const scopesEndpoint = `${clusterUrl}/v1/scopes`;
    try {
      const result = await netRequestPromise(scopesEndpoint);
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
  async resetClusterUrl() {
    this.#clusterUrl = null;
  }

  // Quick and dirty event handler pattern to enable the application to respond
  // when the clusterUrl is changed.
  #clusterUrlWatchers = [];

  onClusterUrlChange(fn) {
    this.#clusterUrlWatchers.push(fn);
  }

  triggerClusterUrlChanged() {
    this.#clusterUrlWatchers.forEach((fn) => fn(this.#clusterUrl));
  }
}

module.exports = RuntimeSettings;
