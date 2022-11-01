import Service from '@ember/service';

/**
 * A simple service that wraps around the global window and
 * document variables that allows us to mock them in testing
 */
export default class BrowserObjectService extends Service {
  /**
   * The global window object
   * @returns {Window}
   */
  get window() {
    return window;
  }

  /**
   * The global document object
   * @returns {Document}
   */
  get document() {
    return this.window?.document;
  }

  /**
   * The hostname of the current location of the URL
   * @returns {string}
   */
  get hostname() {
    return this.window?.location?.hostname;
  }
}
