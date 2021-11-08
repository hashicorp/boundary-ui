import Route from '@ember/routing/route';

export default class ScopesScopeAuthMethodsIndexRoute extends Route {
  // =methods

  /**
   * Adds the scope to the controller context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    const scopeModel = this.modelFor('scopes.scope');
    const type = this.controllerFor('scopes.scope.auth-methods')['filter-type'];
    const is_primary = this.controllerFor('scopes.scope.auth-methods')[
      'filter-is_primary'
    ];
    controller.setProperties({
      scopeModel,
      filters: {
        type: {
          items: ['password', 'oidc'],
          selectedItems: type ? JSON.parse(type) : null,
        },
        is_primary: {
          items: [true, false],
          selectedItems: is_primary ? JSON.parse(is_primary) : null,
        },
      },
    });
  }
}
