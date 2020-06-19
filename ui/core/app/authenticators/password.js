import BasePasswordAuthenticator from 'auth/authenticators/password';
import { inject as service } from '@ember/service';
import config from '../config/environment';

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
    const { namespace } = config.api;
    const orgId = this.scope.org.id;
    return `/${namespace}/orgs/${orgId}/authenticate`;
  }

}
