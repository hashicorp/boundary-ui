import Route from '@ember/routing/route';

export default class ScopesScopeRolesRoleIndexRoute extends Route {

  /**
   * Load the role's scope and sub scopes into a hierarchical data structure.
   * @param {Model} model
   */
  async afterModel(model) {
    const defaultScope = await this.store.findRecord('scope', model.scopeID);
    const subScopes = (await this.store.query('scope', { scope_id: defaultScope.id }))
      .map(scope => ({
        model: scope,
        subScopes: this.store.query('scope', { scope_id: scope.id })
      }));
    const grantScopes = [{
      model: defaultScope,
      subScopes
    }];
    this.set('grantScopes', grantScopes);
  }

  /**
   * Adds `grantScopes` to the context.
   * @param {Controller} controller
   */
  setupController(controller) {
    super.setupController(...arguments);
    controller.set('grantScopes', this.grantScopes);
  }

}
