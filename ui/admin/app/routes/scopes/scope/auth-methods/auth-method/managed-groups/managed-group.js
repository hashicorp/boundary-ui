import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsAuthMethodManagedGroupsManagedGroupRoute extends Route {
  // =methods

  /**
   * Load managed group by ID.
   * @param {object} params
   * @param {string} params.managed_group_id
   * @returns {ManagedGroupModel}
   */
  model({ managed_group_id }) {
    return this.store.findRecord('managed-group', managed_group_id, {
      reload: true,
    });
  }

  /**
   * Render the route-set specific page sections
   * @override
   */
  renderTemplate() {
    super.renderTemplate(...arguments);

    this.render(
      'scopes/scope/auth-methods/auth-method/managed-groups/managed-group/-header',
      {
        into: 'scopes/scope/auth-methods/auth-method',
        outlet: 'header',
      }
    );

    this.render(
      'scopes/scope/auth-methods/auth-method/managed-groups/managed-group/-actions',
      {
        into: 'scopes/scope/auth-methods/auth-method',
        outlet: 'actions',
      }
    );

    this.render(
      'scopes/scope/auth-methods/auth-method/managed-groups/managed-group/-navigation',
      {
        into: 'scopes/scope/auth-methods/auth-method',
        outlet: 'navigation',
      }
    );
  }
}
