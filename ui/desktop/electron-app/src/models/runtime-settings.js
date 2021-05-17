const netRequestPromise = require('../helpers/net-request-promise.js');

// Runtime settings are any configuration, especially user-specified,
// set up at runtime.  For example, the Boundary origin is a runtime setting.
class RuntimeSettings {
  // Internal private origin is exposed via getter/setter below.
  #origin = undefined;

  /**
   * The user-specified Boundary origin, which should be allowed by CSP.
   * @type {?string}
   */
  get origin() {
    return this.#origin;
  }
  set origin(origin) {
    if (this.#origin !== origin) {
      this.#origin = origin;
      this.triggerOriginChanged();
    }
  }

  /**
   * Validates the origin is reachable and has a scopes endpoint.
   */
  async validateOrigin(origin) {
    // If the origin is the Electron origin, it is automatically valid.
    if (origin === 'serve://boundary') return true;
    // Otherwise, check if scopes can be loaded from the specified origin.
    // Scopes are required by the desktop client, so this is a simple smoke
    // test to see if the origin is API-compatible with the desktop client.
    const scopesEndpoint = `${origin}/v1/scopes`;
    try {
      await netRequestPromise(scopesEndpoint);
    } catch (e) {
      throw new Error(`Origin ${origin} could not be validated.`);
    }
  }

  /**
   * Sets the origin to null.
   */
  async resetOrigin() {
    this.origin = null;
  }

  // Quick and dirty event handler pattern to enable the application to respond
  // when the origin is changed.
  #originWatchers = [];

  onOriginChange(fn) {
    this.#originWatchers.push(fn);
  }

  triggerOriginChanged() {
    this.#originWatchers.forEach((fn) => fn(this.#origin));
  }
}

module.exports = RuntimeSettings;
