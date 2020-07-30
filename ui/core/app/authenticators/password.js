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
  buildDeauthEndpointURL({ org_id: scopeID }) {
    const adapter = this.store.adapterFor('application');
    const options = { adapterOptions: { method: 'deauthenticate' } };
    return adapter.buildURL('scope', scopeID, options, 'findRecord');
  }
}
