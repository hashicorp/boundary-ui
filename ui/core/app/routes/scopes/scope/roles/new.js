import Route from '@ember/routing/route';

export default class ScopesScopeRolesNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved role.
   * @return {RoleModel}
   */
  model() {
    const { id: scopeID } = this.modelFor('scopes.scope');
    return this.store.createRecord('role', { scopeID });
  }
}
