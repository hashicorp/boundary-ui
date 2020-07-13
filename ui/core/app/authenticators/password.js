import BasePasswordAuthenticator from 'auth/authenticators/password';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

/**
 * A username/password authenticator that authenticates with an
 * org-scoped endpoint.
 */
export default class PasswordAuthenticator extends BasePasswordAuthenticator {
  // =services

  @service scope;

  // =attributes

  // =methods

  /**
   * Same as endpoint, with an `:authenticate` suffix.
   * @param {string} authMethodID
   * @return {string}
   */
  buildAuthEndpointURL(authMethodID) {
    const adapter = getOwner(this).lookup('adapter:auth-method');
    const authMethodURL = adapter.buildURL('auth-method', authMethodID);
    return `${authMethodURL}:authenticate`;
  }

  /**
   * Same as endpoint, with an `:deauthenticate` suffix.
   * @return {string}
   */
  buildDeauthEndpointURL() {
    const adapter = getOwner(this).lookup('adapter:application');
    const { id: orgId } = this.scope.org;
    const orgURL = adapter.buildURL('org', orgId);
    return `${orgURL}:deauthenticate`;
  }
}
