import BaseOIDCAuthenticator from 'auth/authenticators/oidc';
import { inject as service } from '@ember/service';

/**
 * An OIDC authenticator that handles flow kick-off and polling.
 */
export default class OIDCAuthenticator extends BaseOIDCAuthenticator {
  // =services

  @service store;

  // =methods

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
   * Generates an auth token validation URL used to check tokens on restoration.
   * @override
   * @param {string} tokenID
   * @return {string}
   */
  buildTokenValidationEndpointURL(tokenID) {
    const adapter = this.store.adapterFor('auth-token');
    return adapter.buildURL('auth-token', tokenID, {}, 'findRecord');
  }
}
