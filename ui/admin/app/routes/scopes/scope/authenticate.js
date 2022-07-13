import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeAuthenticateRoute extends Route {
  // =services

  @service session;
  @service router;
  @service resourceFilterStore;
  // =methods

  beforeModel() {
    if (this.session.isAuthenticated)
      this.router.transitionTo('scopes.scope.index');
  }

  /**
   * Returns all auth methods for the current scope, along with the current
   * scope and all scopes (for org navigation).
   * @return {Promise} `{scope, scopes, authMethods}`
   */
  async model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    // Fetch auth methods for the current scope
    const authMethods = await this.resourceFilterStore.queryBy(
      'auth-method',
      {
        authorized_actions: [{ contains: 'authenticate' }],
      },
      {
        scope_id,
      }
    );
    // Preload all authenticatable auth methods into the store
    const authMethodsForAllScopes = await this.resourceFilterStore.queryBy(
      'auth-method',
      {
        authorized_actions: [{ contains: 'authenticate' }],
      },
      {
        scope_id: 'global',
        recursive: true,
      }
    );
    // Fetch org scopes
    // and filter out any that have no auth methods
    const scopes = this.modelFor('scopes').filter(
      ({ id: scope_id, isOrg }) =>
        isOrg && authMethodsForAllScopes.filterBy('scopeID', scope_id).length
    );
    return hash({
      scope: this.modelFor('scopes.scope'),
      scopes,
      authMethods,
      // for integration testing:
      // authMethods: A([{
      //   id: 'am_1234567890',
      //   type: 'password'
      // }])
    });
  }
}
