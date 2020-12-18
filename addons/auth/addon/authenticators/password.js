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
 * When a session is restored, a call is made to the endpoint specified by
 * `buildTokenValidationEndpointURL`.  If this endpoint responds with 401 or
 * 404, then the session is invalid and the restoration is rejected.  All other
 * responses will resolve the session restoration successfully.
 *
 * This authenticator should not be used directly because it does not specify
 * an `buildAuthEndpointURL`, `buildDeauthEndpointURL`, or
 * `buildTokenValidationEndpointURL` of its own.
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
   * Checks that the given token is valid and resolves, otherwise rejects.
   */
  async validateToken(token, tokenID) {
    const tokenValidationURL = this.buildTokenValidationEndpointURL(tokenID);
    const response = await fetch(tokenValidationURL, {
      method: 'get',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // 401 and 404 responses mean the token is invalid, whereas other types of
    // error responses do not tell us about the validity of the token.
    if (response.status === 401 || response.status === 404) return reject();
    return resolve();
  }

  /**
   * Restores the session if data is present and token validation succeeds
   * (any response other than 401 or 404 === success).  Otherwise rejects.
   * @override
   * @param {object} data
   * @return {Promise}
   */
  async restore(data) {
    if (!data) return reject();
    return this.validateToken(data.token, data.id)
      .then(() => this.normalizeData(data));
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
   * @param {string} creds.identification is sent to server as `login_name`
   * @param {string} creds.password
   * @param {boolean} requestCookies request cookie tokens (default `true`)
   * @return {Promise}
   */
  async authenticate(
    { identification: login_name, password },
    requestCookies = true,
    options
  ) {
    const body = JSON.stringify({
      token_type: requestCookies ? 'cookie' : null,
      credentials: { login_name, password },
    });
    const authEndpointURL = this.buildAuthEndpointURL(options);
    const response = await fetch(authEndpointURL, { method: 'post', body });
    const json = await response.json();
    return response.status < 400
      ? resolve(this.normalizeData(json, login_name))
      : reject();
  }

  /**
   * Normalizes the auth data.  Adds convenience booleans depending on the
   * scope within which the session is authenticated:  isGlobal, isOrg.
   * If a `username` is provided, appends this to the data.
   * @param {object} data
   * @param {string} username
   * @return {object}
   */
  normalizeData(data, username) {
    // Add booleans indicated the scope type
    data.isGlobal = (data?.scope?.type === 'global');
    data.isOrg = (data?.scope?.type === 'org');
    if (username) data.username = username;
    return data;
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
