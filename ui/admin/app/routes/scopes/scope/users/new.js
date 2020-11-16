import Route from '@ember/routing/route';

export default class ScopesScopeUsersNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved user.
   * @return {UserModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('user', { scopeModel });
  }
}
