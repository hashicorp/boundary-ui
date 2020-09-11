import Route from '@ember/routing/route';

export default class ScopesScopeProjectsProjectTargetsNewRoute extends Route {

  // =methods

  /**
   * Creates a new unsaved target in current project scope.
   * @return {TargetModel}
   */
  model() {
    const scopeModel = this.modelFor('scopes.scope.projects.project');
    return this.store.createRecord('target', {
      type: 'tcp',
      scopeModel
    });
  }

}
