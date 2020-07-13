import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default class OrgsAuthenticateIndexRoute extends Route {
  // =services

  @service session;

  // =methods

  /**
   * If the current session includes an org ID, then redirect to that org's
   * authenticate route.
   */
  redirect() {
    const orgID = get(this.session, 'data.authenticated.org_id');
    if (this.session.isAuthenticated && orgID) {
      this.transitionTo('orgs.org.authenticate', orgID);
    }
  }
}
