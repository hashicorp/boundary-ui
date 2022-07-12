import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeAuthenticateRoute extends Route {
  // =services

  @service session;
  @service router;

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
    let scopes = this.modelFor('scopes').filter((scope) => scope.isOrg);
    let authMethodsOfAllScopes = await this.store.query('auth-method', {
      scope_id: 'global',
      recursive: true,
    });
    let authMethodsScopeIds = [];
    //filter the scopes with no auth-methods
    authMethodsOfAllScopes.map(({ id: auth_id }) => {
      authMethodsScopeIds.push(
        this.store.peekRecord('auth-method', auth_id).scopeID
      );
    });

    scopes = scopes.filter((scope) => authMethodsScopeIds.includes(scope.id));
    const authMethods = this.store.query('auth-method', { scope_id });
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
