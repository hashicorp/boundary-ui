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
    const allScopes = this.modelFor('scopes').filter((scope) => scope.isOrg);
    const scopesIdList = [];
    const authenticatableAuthMethodsList = [];
    //iterate through the scopes list and get authMethods for each scope
    allScopes.forEach((scope) => {
      if (scope) {
        scopesIdList.push(scope.id);
        authenticatableAuthMethodsList.push(
          this.store.query('auth-method', {
            scope_id: scope.id,
            filter: { authorized_actions: ['authenticate'] },
          })
        );
      }
    });

    return hash({
      scope: this.modelFor('scopes.scope'),
      scopes: this.modelFor('scopes').filter((scope) => scope.isOrg),
      authMethods: this.store.query('auth-method', { scope_id }),
      scopesIdList,
      authenticatableAuthMethodsList,
      // for integration testing:
      // authMethods: A([{
      //   id: 'am_1234567890',
      //   type: 'password'
      // }])
    });
  }
}
