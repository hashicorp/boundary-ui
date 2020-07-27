import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleRoute extends Route {
  // =methods

  /**
   * Load a role in current scope.
   * @param {object} params
   * @param {string} params.role_id
   * @return {RoleModel}
   */
  async model({ role_id }) {
    const { id: scope_id } = this.modelFor('scopes.scope');
    const adapterOptions = { scopeID: scope_id };
    return this.store.findRecord('role', role_id, { adapterOptions });
  }
}
