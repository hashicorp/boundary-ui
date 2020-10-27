import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScopesScopeScopesRoute extends Route {
  // =services

  @service session;

  // =methods

  /**
   * Redirects to scopes/scope/authenticate if unauthenticated.
   */
  beforeModel() {
    if (!this.session.isAuthenticated) {
      this.transitionTo('scopes.scope.authenticate');
    }
  }

  /**
   * Loads sub scopes for the current scope.
   * @param {object} params
   * @param {string} params.scope_id
   * @return {Promise{ScopeModel}}
   */
  async model() {
    const currentScope = this.modelFor('scopes.scope');
    const parentScope = !currentScope.isGlobal
      ? await this.store.findRecord('scope', currentScope.scopeID)
      : null;
    const subScopes =
      await this.store.query('scope', { scope_id: currentScope.id });
    return {
      currentScope,
      parentScope,
      subScopes
    };
  }
}
