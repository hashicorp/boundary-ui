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
   * @param {string} username
   * @param {string} password
   * @return {Promise}
   */
  async authenticate({ username, password }) {
    const response = await fetch(this.authEndpoint, {
      method: 'post',
      body: JSON.stringify({ username, password }),
    });
    return response.status < 400 ? resolve() : reject();
  }
}
