import BaseAuthenticator from './base';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import fetch from 'fetch';

/**
 *
 */
export default class OIDCAuthenticator extends BaseAuthenticator {

  // =services

  @service session;

  // =methods

  /**
   * Generates an auth method URL with which to authenticate.
   * @override
   * @param {object} options
   * @param {string} options.scope.scope_id
   * @param {string} options.authMethod.id
   * @return {string}
   */
  buildTokenAuthEndpointURL(/* {
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  } */) { }

  /**
   * Generates an auth method URL with which to start authentication.
   * @override
   * @param {object} options
   * @param {string} options.scope.scope_id
   * @param {string} options.authMethod.id
   * @return {string}
   */
  buildStartAuthEndpointURL(/* {
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  } */) { }

  /**
   * Kicks-off the OIDC flow:  calls the `authenticate:start` action on the
   * specified auth method, which returns some meta data along with an
   * authorization request URL.
   *
   * @param {boolean} requestCookies request cookie tokens (default `true`)
   * @param {object} options
   * @return {Promise}
   */
  async startAuthentication(requestCookies = true, options) {
    const url = this.buildStartAuthEndpointURL(options);
    const body = JSON.stringify({
      token_type: requestCookies ? 'cookie' : null
    });
    const response = await fetch(url, { method: 'post', body });
    const json = await response.json();
    if (response.status < 400) {
      // Store meta about the pending OIDC flow
      this.session.set('data.pending', {
        oidc: json
      });
      return json;
    } else {
      return reject();
    }
  }

  /**
   *
   */
  async authenticate(json) {
    console.info('Authenticated with OIDC provider');
    return this.normalizeData(json);
  }

  /**
   *
   */
  async attemptOIDCAuthentication(options) {
    const url = this.buildTokenAuthEndpointURL(options);
    const body = JSON.stringify({
      state: this.session.get('data.pending.oidc.state'),
      token_request_id: this.session.get('data.pending.oidc.token_request_id')
    });
    const response = await fetch(url, { method: 'post', body });
    const json = await response.json();
    if (response.status === 100) {
      return false;
    } else if (response.status < 400) {
      // Authentication with OIDC is indirect...
      await this.session.authenticate('authenticator:oidc', json);
      return true;
    } else {
      return reject();
    }
  }
}
