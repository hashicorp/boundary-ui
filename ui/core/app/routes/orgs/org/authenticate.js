import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

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
export default class OrgsOrgAuthenticateRoute extends Route.extend(UnauthenticatedRouteMixin) {

  // =attributes

  /**
   * If the session is already authenticated, `UnauthenticatedRouteMixin` will
   * redirect to the projects index.
   * @type {string}
   */
  routeIfAlreadyAuthenticated = 'orgs.org.projects';

  // =methods

  /**
   * Returns all auth methods from the store.
   * @return {Promise[AuthMethod]}
   */
  model() {
    return this.store.findAll('auth-method');
  }

  /**
   * Adds the current org to the controller scope, for display to users.
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('org', this.modelFor('orgs.org'));
  }

}
