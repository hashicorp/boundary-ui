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

  /**
   * The endpoint is scoped to org and depends on the API configuration.
   * @type {string}
   */
  get endpoint() {
    const adapter = getOwner(this).lookup('adapter:application');
    const { id: orgId } = this.scope.org;
    const orgURL = adapter.buildURL('org', orgId);
    const authenticateURL = `${orgURL}`;
    return authenticateURL;
  }

  /**
   * Same as endpoint, with an `:authenticate` suffix.
   * @type {string}
   */
  get authEndpoint() {
    return `${this.endpoint}:authenticate`
  }

  /**
   * Same as endpoint, with an `:deauthenticate` suffix.
   * @type {string}
   */
  get deauthEndpoint() {
    return `${this.endpoint}:deauthenticate`
  }

}
