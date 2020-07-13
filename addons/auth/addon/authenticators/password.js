import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { resolve, reject } from 'rsvp';
import fetch from 'fetch';

/**
 *
 * This authenticator is intended for use with Ember Simple Auth.
 *
 * Simple id/password base authenticator sends credentials to an endpoint
 * specified in the `authEndpoint` URL.  If the HTTP response code is in the
 * success range, authentication resolves.  Otherwise it rejects.
 *
 * Upon session invalidation, deauthentication is attempted at the
 * `deauthEndpoint`, but is not guaranteed.
 *
 * This authenticator should not be used directly because it does not specify
 * an `authEndpoint` or `deauthEndpoint` of its own.  To use, generate an
 * application authenticator in your app `authenticators/application.js` and
 * extend this class.
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
   * Generates a URL for the given auth method.  Must be implemented in
   * an application authenticator.
   * @param {string} authMethodID
   * @return {string}
   */
  buildAuthEndpointURL(/* authMethodID */) {
    throw new Error(`
      You must implement the "buildAuthEndpointURL" method
      in your authenticator.
    `);
  }

  /**
   * Generates a URL for deauthentication.  Must be implemented in
   * an application authenticator.
   * @return {string}
   */
  buildDeauthEndpointURL() {
    throw new Error(`
      You must implement the "buildDeauthEndpointURL" method
      in your authenticator.
    `);
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
   * @param {string} authMethodId ID of the auth method to use
   * @param {boolean} requestCookies request cookie tokens (default `true`)
   * @return {Promise}
   */
  async authenticate(
    { identification: name, password },
    authMethodID,
    requestCookies = true
  ) {
    const body = JSON.stringify({
      auth_method_id: authMethodID,
      token_type: requestCookies ? 'cookie' : null,
      credentials: { name, password },
    });
    const authEndpoint = this.buildAuthEndpointURL(authMethodID);
    const response = await fetch(authEndpoint, { method: 'post', body });
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
  invalidate() {
    const deauthEndpoint = this.buildDeauthEndpointURL();
    fetch(deauthEndpoint, { method: 'post' }).catch(() => {
      /* no op */
    });
    return super.invalidate(...arguments);
  }
}
