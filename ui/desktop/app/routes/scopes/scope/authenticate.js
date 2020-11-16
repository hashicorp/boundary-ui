import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';

export default class ScopesScopeAuthenticateRoute extends Route {
  // =services

  @service session;

  // =methods

  beforeModel() {
    if (this.session.isAuthenticated) this.replaceWith('scopes.scope.index');
  }

  /**
   * Returns all auth methods for the current scope, along with the current
   * scope and all scopes (for org navigation).
   * @return {Promise} `{scope, scopes, authMethods}`
   */
  model() {
    const { id: scope_id } = this.modelFor('scopes.scope');
    return hash({
      scope: this.modelFor('scopes.scope'),
      scopes: this.modelFor('scopes').filter((scope) => scope.isOrg),
      authMethods: this.store.query('auth-method', { scope_id }),
    });
  }
}
