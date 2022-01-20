import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsNewRoute extends Route {
  // =methods
  model() {
    const { id: auth_method_id, type } = this.modelFor(
      'scopes.scope.auth-methods.auth-method'
    );
    return this.store.createRecord('managed-group', {
      type,
      auth_method_id,
    });
  }
}
