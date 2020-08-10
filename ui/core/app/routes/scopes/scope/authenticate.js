import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeAuthenticateRoute extends Route {
  // =services

  @service session;

  // =attributes

  // TODO:  this assumes we're in an org scope, but the "landing"
  // for global scope is probably different.
  routeIfAlreadyAuthenticated = 'scopes.scope.projects';

  // =methods

  /**
   * Returns all auth methods for the current scope, along with the current
   * scope and all scopes (for org navigation).
   * @return {Promise} `{scope, scopes, authMethods}`
   */
  model() {
    const adapterOptions = { scopeID: this.modelFor('scopes.scope').id };
    return hash({
      scope: this.modelFor('scopes.scope'),
      scopes: this.modelFor('scopes'),
      authMethods: this.store.findAll('auth-method', { adapterOptions }),

      // for integration testing:
      // authMethods: A([{
      //   id: 'am_1234567890',
      //   type: 'password'
      // }])
    });
  }

  redirect() {
    if (this.session.isAuthenticated) {
      this.transitionTo(this.routeIfAlreadyAuthenticated);
    }
  }
}
