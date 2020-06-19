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
   * The endpoint for authenticate is scoped to org and depends on the
   * configured host and namespace.
   * @type {string}
   */
  get authEndpoint() {
    const adapter = getOwner(this).lookup('adapter:application');
    const { id: orgId } = this.scope.org;
    const orgURL = adapter.buildURL('org', orgId);
    const authenticateURL = `${orgURL}:authenticate`;
    return authenticateURL;
  }

}
