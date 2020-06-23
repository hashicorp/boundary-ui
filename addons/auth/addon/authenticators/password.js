import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import { resolve, reject } from 'rsvp';
import fetch from 'fetch';

/**
 *
 * This authenticator is intended for use with Ember Simple Auth.
 *
 * Username/password base authenticator sends credentials to an endpoint
 * specified in the `authEndpoint` URL.  If the HTTP response code is in the
 * success range, authentication resolves.  Otherwise it rejects.
 *
 * This authenticator should not be used directly because it does not specify
 * an `authEndpoint` of its own.  To use, generate an application authenticator
 * in your app `authenticators/application.js` and extend this class.
 *
 * @example
 *
 *   import PasswordAuthenticator from 'auth/authenticators/password';
 *   export default class ApplicationAuthenticator extends PasswordAuthenticator {
 *     authEndpoint = '/api/authenticate';
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
   * @override
   * @param {object} creds
   * @param {string} authMethodId ID of the auth method to use
   * @param {boolean} requestCookies request cookie tokens (default `true`)
   * @return {Promise}
   */
  async authenticate(creds, authMethodID, requestCookies=true) {
    const url = requestCookies ?
      `${this.authEndpoint}?token_type=cookie` :
      this.authEndpoint;
    const response = await fetch(url, {
      method: 'post',
      body: JSON.stringify({
        auth_method_id: authMethodID,
        credentials: creds
      })
    });
    return response.status < 400 ? resolve() : reject();
  }
}
