import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ScopesScopeAuthenticateMethodOidcController extends Controller {
  // =services

  @service session;

  // =attributes

  /**
   * Authetnication URL for the pending OIDC flow, if any.
   * @type {?string}
   */
  get authURL() {
    return this.session.data.pending.oidc.attributes.auth_url;
  }
}
