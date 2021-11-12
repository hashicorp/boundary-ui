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

  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/auth-methods/auth-method/managed-groups/new/-header',
      {
        into: 'scopes/scope/auth-methods/auth-method',
        outlet: 'header',
      }
    );

    this.render('_empty', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'actions',
    });

    this.render('_empty', {
      into: 'scopes/scope/auth-methods/auth-method',
      outlet: 'navigation',
    });
  }
}
