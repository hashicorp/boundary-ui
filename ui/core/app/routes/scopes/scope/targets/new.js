import Route from '@ember/routing/route';

export default class ScopesScopeTargetsNewRoute extends Route {
  // =methods

  /**
   * Creates a new unsaved target in current scope.
   * @return {TargetModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope');
    return this.store.createRecord('target', {
      type: 'tcp',
      scopeModel,
    });
  }
}
