import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectTargetsRoute extends Route {
  // =methods

  /**
   * Loads all targets under current project scope.
   * @return {Promise{[TargetModel]}}
   */
  async model() {
    const scopeID = this.modelFor('scopes.scope.projects.project').id;
    return this.store.findAll('target', { adapterOptions: { scopeID } });
  }
}
