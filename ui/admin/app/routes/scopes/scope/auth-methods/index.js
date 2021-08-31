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
    controller.scopeModel = scopeModel;
  }
  // setupController(controller) {
  //   const scope = this.modelFor('scopes.scope');
  //   super.setupController(...arguments);
  //   controller.setProperties({ scope });
  // }
}
