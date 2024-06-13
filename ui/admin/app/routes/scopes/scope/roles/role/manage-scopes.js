import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleManageScopesRoute extends Route {
  // =methods

  model() {
    return this.modelFor('scopes.scope.roles.role');
  }
}
