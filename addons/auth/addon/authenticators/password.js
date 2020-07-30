import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { resolve, reject } from 'rsvp';
import fetch from 'fetch';

/**
 *
 * This authenticator is intended for use with Ember Simple Auth.
 *
 * Simple id/password base authenticator sends credentials to an endpoint
 * specified by the `buildAuthEndpointURL`.  If the HTTP response code is in the
 * success range, authentication resolves.  Otherwise it rejects.
 *
 * Upon session invalidation, deauthentication is attempted at the URL generated
 * by `buildDeauthEndpointURL`, but is not guaranteed.
 *
 * This authenticator should not be used directly because it does not specify
 * an `buildAuthEndpointURL` or `buildDeauthEndpointURL` of its own.
 * To use, generate an application authenticator in your app
 * `authenticators/application.js` and extend this class.
 *
 * @example
 *
 *   import PasswordAuthenticator from 'auth/authenticators/password';
 *   export default class ApplicationAuthenticator extends PasswordAuthenticator {
 *     authEndpoint = '/api/authenticate';
 *     deauthEndpoint = '/api/deauthenticate';
 *   }
 *
 */
export default class PasswordAuthenticator extends BaseAuthenticator {
  // =methods

  /**
   * Restores the session if data is present.  Otherwise rejects.
   * @override
   * @param {object} data
   * @return {Promise}
   */
  restore(data) {
    return data ? resolve(data) : reject();
  }

  /**
   * Posts credentials to the URL specified in `authEndpoint` and resolves
   * if a success HTTP status code is received, otherwise rejects.
   *
   * If requesting cookies, be sure to use the cookie session store.  Otherwise
   * use the local storage session store.
   *
   * @override
   * @param {object} creds
   * @param {string} creds.identification is sent to server as `name`
   * @param {string} creds.password
   * @param {boolean} requestCookies request cookie tokens (default `true`)
   * @return {Promise}
   */
  async authenticate(
    { identification: name, password },
    requestCookies = true,
    options
  ) {
    const body = JSON.stringify({
      token_type: requestCookies ? 'cookie' : null,
      credentials: { name, password },
    });
    const authEndpointURL = this.buildAuthEndpointURL(options);
    const response = await fetch(authEndpointURL, { method: 'post', body });
    const json = await response.json();
    return response.status < 400 ? resolve(json) : reject();
  }

  /**
   * Posts to the `deauthEntpoint` on a best-effort basis and then returns.
   * Deauthentication with the server is not guaranteed and request failures
   * are ignored.
   *
   * @override
   * @return {Promise}
   */
  invalidate(options) {
    const deauthEndpointURL = this.buildDeauthEndpointURL(options);
    fetch(deauthEndpointURL, { method: 'post' }).catch(() => {
      /* no op */
    });
    return super.invalidate(...arguments);
  }
}
