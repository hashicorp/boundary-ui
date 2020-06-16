import BaseUserPassAuthenticator from 'auth/authenticators/userpass';
import { inject as service } from '@ember/service';
import config from '../config/environment';

/**
 * A username/password authenticator that authenticates with an
 * org-scoped endpoint.
 */
export default class UserPassAuthenticator extends BaseUserPassAuthenticator {

  // =services

  @service scope;

  // =attributes

  /**
   * The endpoint for login is scoped to org and depends on the configured
   * host and namespace.
   * @type {string}
   */
  get authEndpoint() {
    const { namespace } = config.api;
    const orgId = this.scope.org.id;
    return `/${namespace}/orgs/${orgId}/login`;
  }

}
