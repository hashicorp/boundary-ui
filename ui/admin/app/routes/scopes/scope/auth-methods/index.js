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
    const filterType = this.controllerFor('scopes.scope.auth-methods')['filter-type'];
    controller.setProperties({
      scopeModel,
      filters: {
        type: {
          items: ['password', 'oidc'],
          selectedItems: filterType ? JSON.parse(filterType) : null
        }
      }
    });
  }
}
