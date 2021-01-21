import BaseAuthenticator from './base';
import { resolve, reject } from 'rsvp';
import fetch from 'fetch';

/**
 *
 */
export default class OIDCAuthenticator extends BaseAuthenticator {

  // =unimplemented methods
  // TODO: implement ;-)

  buildAuthEndpointURL(/* {
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  } */) { }

  buildStartAuthEndpointURL(/* {
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  } */) { }

  /**
   *
   */
  async startAuthentication(
    creds,
    requestCookies = true,
    options
  ) {
    const body = JSON.stringify({
      token_type: requestCookies ? 'cookie' : null
    });
    const authEndpointURL = this.buildStartAuthEndpointURL(options);
    const response = await fetch(authEndpointURL, { method: 'post', body });
    const json = await response.json();
    const normalized = this.normalizeData(json);
    if (response.status < 400) {
      await this.openExternalOIDCFlow(normalized.authorization_request_url);
      resolve(normalized);
    } else {
      reject();
    }
  }

  /**
   * Opens the specified URL in a new tab or window.  By default this uses
   * `window.open`, but may be overriden.
   * @param {string} url
   */
  openExternalOIDCFlow(url) {
    window.open(url);
  }

  async authenticate(
    // creds,
    // requestCookies = true,
    // options
  ) {
    return false;
  }
}
