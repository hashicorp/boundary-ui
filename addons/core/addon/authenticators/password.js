/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import BasePasswordAuthenticator from 'auth/authenticators/password';
import { inject as service } from '@ember/service';

/**
 * A username/password authenticator that authenticates with
 * a scope/auth-method endpoint.  Authentication occurs on an auth method
 * endpoint, while deauthentication occurs on a scope endpoint.
 */
export default class PasswordAuthenticator extends BasePasswordAuthenticator {
  // =services

  @service store;

  // =attributes

  /**
   * Generates an auth method URL with which to authenticate.
   * @override
   * @param {object} options
   * @param {string} options.scope.scope_id
   * @param {string} options.authMethod.id
   * @return {string}
   */
  buildAuthEndpointURL({
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  }) {
    const adapter = this.store.adapterFor('application');
    const options = { adapterOptions: { scopeID, method: 'authenticate' } };
    return adapter.buildURL('auth-method', authMethodID, options, 'findRecord');
  }

  /**
   * Generates a scope URL with which to deauthenticate.
   * @override
   * @param {object} options
   * @param {string} scopeID
   * @return {string}
   */
  buildDeauthEndpointURL({ id }) {
    const adapter = this.store.adapterFor('application');
    return adapter.buildURL('auth-token', id, {}, 'findRecord');
  }

  /**
   * Generates an auth token validation URL used to check tokens on restoration.
   * @override
   * @param {string} tokenID
   * @return {string}
   */
  buildTokenValidationEndpointURL(tokenID) {
    const adapter = this.store.adapterFor('auth-token');
    return adapter.buildURL('auth-token', tokenID, {}, 'findRecord');
  }

  /**
   * Intercepts the authenticate response, if any, and assigns the returned
   * token to all future requests via `addTokenToAuthorization`.
   * Returns the response data as normal.
   * @override
   */
  authenticate() {
    return super.authenticate(...arguments).then((data) => {
      const token = data?.attributes?.token;
      this.addTokenToAuthorization(token);
      return data;
    });
  }

  /**
   * When restoring the session (say, on load), assigns the session token
   * to all future requests via `addTokenToAuthorization`.
   * @override
   * @param {object} data
   * @return {object}
   */
  restore(data) {
    const token = data?.attributes?.token;
    this.addTokenToAuthorization(token);
    return super.restore(data);
  }

  /**
   * Assigns a token string all future requests via the `Authorization` header
   * on the application adapter prototype.  Only application and adapters that
   * extend the application adapter receive this header (which is most).
   *
   * TODO:  if cookies were requested, this step should be skipped.
   *
   * @param {string} token
   */
  addTokenToAuthorization(token) {
    const adapterPrototype =
      this.store.adapterFor('application').constructor.prototype;
    const headers = adapterPrototype?.headers;
    if (!headers) adapterPrototype.headers = {};
    adapterPrototype.headers.Authorization = null;
    adapterPrototype.headers.Authorization = `Bearer ${token}`;
  }
}
