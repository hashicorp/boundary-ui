import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

/**
 * The org-scoped login route has two primary responsibilities:
 *
 * 1. If already authenticated, redirect to the org's projects index.
 * 2. If unauthenticated, load all auth methods and display method navigation.
 *
 * Actual authentication occurs in the `orgs.org.login.method` route, which
 * corresponds to a specific auth method.
 *
 */
export default class OrgsOrgLoginRoute extends Route.extend(UnauthenticatedRouteMixin) {

  // =attributes

  /**
   * If the session is already authenticated, `UnauthenticatedRouteMixin` will
   * redirect to the projects index.
   * @type {string}
   */
  routeIfAlreadyAuthenticated = 'orgs.org.projects';

  // =methods

  model() {
    return this.store.findAll('auth-method');
  }

}
