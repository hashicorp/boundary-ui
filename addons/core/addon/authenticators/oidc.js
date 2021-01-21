import BaseOIDCAuthenticator from 'auth/authenticators/oidc';
import { inject as service } from '@ember/service';

/**
 *
 */
export default class OIDCAuthenticator extends BaseOIDCAuthenticator {

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
  buildStartAuthEndpointURL({
    scope: { id: scopeID },
    authMethod: { id: authMethodID },
  }) {
    const adapter = this.store.adapterFor('application');
    const options = {
      adapterOptions: {
        scopeID,
        method: 'authenticate:start'
      }
    };
    return adapter.buildURL('auth-method', authMethodID, options, 'findRecord');
  }

}
