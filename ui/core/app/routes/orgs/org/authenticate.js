import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

/**
 * The org-scoped authenticate route has two primary responsibilities:
 *
 * 1. If already authenticated, redirect to the org's projects index.
 * 2. If unauthenticated, load all auth methods and display method navigation.
 *
 * Actual authentication occurs in the `orgs.org.authenticate.method` route,
 * which corresponds to a specific auth method.
 *
 */
export default class OrgsOrgAuthenticateRoute extends Route.extend() {

  // =services

  @service session;

  // =methods

  /**
   * Redirects to projects index if already authenticated.
   */
  redirect() {
    if (this.session.isAuthenticated) this.transitionTo('orgs.org.projects');
  }

  /**
   * Returns all auth methods for the current org, along with the current org
   * and all orgs (for org navigation).
   * @return {Promise} `{org, orgs, authMethods}`
   */
  model() {
    return hash({
      org: this.modelFor('orgs.org'),
      orgs: this.modelFor('orgs'),
      authMethods: this.store.findAll('auth-method')
    });
  }

}
