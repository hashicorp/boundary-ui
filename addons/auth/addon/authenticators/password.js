/**
 * Copyright IBM Corp. 2021, 2025
 * SPDX-License-Identifier: BUSL-1.1
 */

import BaseAuthenticator from './base';
import { resolve, reject } from 'rsvp';
import { waitForPromise } from '@ember/test-waiters';

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
    options,
  ) {
    const body = JSON.stringify({
      command: 'login',
      type: requestCookies ? 'cookie' : null,
      attributes: { login_name, password },
    });
    const authEndpointURL = this.buildAuthEndpointURL(options);
    // Note: waitForPromise is needed to provide the necessary integration with @ember/test-helpers
    // visit https://www.npmjs.com/package/@ember/test-waiters for more info.
    const response = await waitForPromise(
      fetch(authEndpointURL, { method: 'post', body }),
    );
    const json = await response.json();
    return response.status < 400 ? resolve(this.normalizeData(json)) : reject();
  }
}
